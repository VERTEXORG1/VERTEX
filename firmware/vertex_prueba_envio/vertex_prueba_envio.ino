/*
  VERTEX · Prueba del dispositivo de captura (montaje provisional, Etapa A)
  ESP32 DevKit 30 pines + RTC DS3231 (I2C) + sonda DS18B20 (opcional).

  Qué hace:
   - El RTC DS3231 es el reloj maestro: su hora (UTC) es el event_time.
   - Cada minuto del RTC toma una lectura y la guarda en memoria.
   - Cada 5 minutos envía las lecturas pendientes a la API
     (POST VX_URL/api/captura/lotes, con la clave del dispositivo) y solo las
     borra de la memoria cuando el servidor responde 2xx.
   - Sin Wi-Fi o sin respuesta del servidor, las lecturas se conservan y salen
     completas y en orden en el siguiente envío. El servidor ignora las repetidas.

  ETAPA 1: solo la hora del RTC, cada segundo.
  ETAPA 2: + conexión Wi-Fi y ajuste de la hora del RTC por internet (NTP).
  ETAPA 3: + lecturas, paquetes JSON y lotes cada 5 minutos (solo en el monitor).
  ETAPA 4: + envío real a la API (VX_URL, VX_DISPOSITIVO y VX_CLAVE en secrets.h).

  Monitor serie: 115200 baudios.
*/
#define ETAPA 4
#define EN_WOKWI 0   // 1 solo en el simulador Wokwi (allí el RTC es un DS1307)

#include <Wire.h>
#include <RTClib.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <NetworkClientSecure.h>
#include <time.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#if __has_include("secrets.h")
  #include "secrets.h"            // WIFI_SSID/WIFI_PASS (y opcional WIFI_SSID_2/WIFI_PASS_2): archivo local, fuera de git
#else
  #define WIFI_SSID "Wokwi-GUEST" // red abierta del simulador Wokwi
  #define WIFI_PASS ""
#endif

#if ETAPA >= 4 && !(defined(VX_URL) && defined(VX_DISPOSITIVO) && defined(VX_CLAVE))
  #error "ETAPA 4 necesita VX_URL, VX_DISPOSITIVO y VX_CLAVE en secrets.h (ver secrets.h.example)"
#endif

WiFiMulti redes;   // se conecta a la red disponible con mejor señal de las registradas

const char*    EQUIPO         = "CERO-011";  // CERO de pruebas: no se mezcla con la demo del CERO-010
const uint8_t  PIN_SDA        = 21;
const uint8_t  PIN_SCL        = 22;
const uint8_t  PIN_DS18B20    = 4;
const uint8_t  MINUTOS_ENVIO  = 5;
const uint16_t MAX_PENDIENTES = 1440;  // 24 h de lecturas en memoria
const uint16_t MAX_POR_LOTE   = 60;    // lecturas por petición al servidor

#if EN_WOKWI
RTC_DS1307 rtc;
#else
RTC_DS3231 rtc;
#endif
OneWire oneWire(PIN_DS18B20);
DallasTemperature sondas(&oneWire);
bool haySonda = false;

struct Lectura { uint32_t seq; uint32_t t; float corriente; float temp; bool hayTemp; };
Lectura  pendientes[MAX_PENDIENTES];   // cola circular, de la más antigua a la más reciente
uint16_t inicio = 0, cantidad = 0;
uint32_t seq = 0;                      // se reinicia al reiniciar (luego irá a memoria flash)
uint32_t ultimoMinuto = 0;
uint32_t ultimoReintentoWifi = 0;

String isoUTC(uint32_t t) {
  DateTime d(t);
  char b[24];
  snprintf(b, sizeof b, "%04d-%02d-%02dT%02d:%02d:%02dZ",
           d.year(), d.month(), d.day(), d.hour(), d.minute(), d.second());
  return String(b);
}

bool rtcPerdioHora() {
#if EN_WOKWI
  return !rtc.isrunning();
#else
  return rtc.lostPower();
#endif
}

void conectarWifi(uint32_t esperaMs) {
  WiFi.mode(WIFI_STA);
  redes.addAP(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WIFI] Redes registradas: \"%s\"", WIFI_SSID);
#ifdef WIFI_SSID_2
  redes.addAP(WIFI_SSID_2, WIFI_PASS_2);
  Serial.printf(", \"%s\"", WIFI_SSID_2);
#endif
  Serial.println(". Buscando...");
  uint32_t t0 = millis();
  while (redes.run(5000) != WL_CONNECTED && millis() - t0 < esperaMs) { Serial.print('.'); }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED)
    Serial.printf("[WIFI] Conectado a \"%s\". IP %s, senal %d dBm\n",
                  WiFi.SSID().c_str(), WiFi.localIP().toString().c_str(), WiFi.RSSI());
  else
    Serial.println("[WIFI] Sin conexion (se reintenta cada 30 s; las lecturas se siguen guardando).");
}

void ajustarHoraNTP() {
  configTime(0, 0, "pool.ntp.org", "time.google.com");  // UTC
  struct tm tm;
  if (!getLocalTime(&tm, 10000)) { Serial.println("[NTP] Sin respuesta; se conserva la hora del RTC."); return; }
  uint32_t ntp = (uint32_t)time(nullptr);
  long dif = (long)ntp - (long)rtc.now().unixtime();
  Serial.printf("[NTP] Hora de internet %s (diferencia con el RTC: %ld s)\n", isoUTC(ntp).c_str(), dif);
  if (labs(dif) > 2) { rtc.adjust(DateTime(ntp)); Serial.println("[NTP] RTC ajustado."); }
}

String paqueteJSON(const Lectura& l) {
  char temp[12];
  if (l.hayTemp) snprintf(temp, sizeof temp, "%.2f", l.temp); else strcpy(temp, "null");
  char b[200];
  snprintf(b, sizeof b,
           "{\"equipo\":\"%s\",\"seq\":%lu,\"event_time\":\"%s\","
           "\"lecturas\":{\"CORRIENTE_MOTOR\":%.3f,\"TEMPERATURA_MOT\":%s}}",
           EQUIPO, (unsigned long)l.seq, isoUTC(l.t).c_str(), l.corriente, temp);
  return String(b);
}

void tomarLectura(uint32_t t) {
  Lectura l;
  l.seq = ++seq;
  l.t = t;
  l.corriente = 0.0;  // aún sin sensor de corriente: va en cero
  l.hayTemp = false;
  l.temp = 0;
  if (haySonda) {
    sondas.requestTemperatures();
    float c = sondas.getTempCByIndex(0);
    if (c != DEVICE_DISCONNECTED_C) { l.temp = c; l.hayTemp = true; }
  }
  if (cantidad == MAX_PENDIENTES) {
    inicio = (inicio + 1) % MAX_PENDIENTES;
    cantidad--;
    Serial.println("[MEMORIA] Llena: se descarta la lectura mas antigua.");
  }
  pendientes[(inicio + cantidad) % MAX_PENDIENTES] = l;
  cantidad++;
  Serial.printf("[LECTURA] %s  (pendientes: %u)\n", paqueteJSON(l).c_str(), cantidad);
}

#if ETAPA >= 4
// POST del lote a la API. Devuelve el código HTTP (negativo si no hubo respuesta).
int postLote(const String& cuerpo, String& respuesta) {
  String url = String(VX_URL) + "/api/captura/lotes";
  NetworkClientSecure tls;
  NetworkClient plano;
  HTTPClient http;
  bool ok;
  if (url.startsWith("https://")) {
    tls.useBuiltinCACertBundle();  // certificados raíz de confianza (Mozilla)
    ok = http.begin(tls, url);
  } else {
    ok = http.begin(plano, url);   // solo para pruebas en la red local
  }
  if (!ok) { respuesta = "URL invalida"; return -1; }
  http.setTimeout(20000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Dispositivo", VX_DISPOSITIVO);
  http.addHeader("Authorization", String("Bearer ") + VX_CLAVE);
  int codigo = http.POST(cuerpo);
  respuesta = codigo > 0 ? http.getString() : http.errorToString(codigo);
  http.end();
  return codigo;
}
#endif

void enviarLote() {
  if (cantidad == 0) return;
  if (WiFi.status() != WL_CONNECTED) {
    Serial.printf("[ENVIO] Sin Wi-Fi: %u lecturas quedan guardadas para el proximo envio.\n", cantidad);
    return;
  }
  while (cantidad > 0) {
    uint16_t n = cantidad < MAX_POR_LOTE ? cantidad : MAX_POR_LOTE;
    Serial.printf("[ENVIO] Lote de %u lecturas (seq %lu a %lu)", n,
                  (unsigned long)pendientes[inicio].seq,
                  (unsigned long)pendientes[(inicio + n - 1) % MAX_PENDIENTES].seq);
    String cuerpo = "[";
    for (uint16_t i = 0; i < n; i++) {
      if (i) cuerpo += ",";
      cuerpo += paqueteJSON(pendientes[(inicio + i) % MAX_PENDIENTES]);
    }
    cuerpo += "]";
#if ETAPA >= 4
    Serial.printf(" -> %s\n", VX_URL);
    String respuesta;
    int codigo = postLote(cuerpo, respuesta);
    if (codigo >= 200 && codigo < 300) {
      Serial.printf("[ENVIO] OK %d: %s\n", codigo, respuesta.c_str());
    } else if (codigo == 400) {
      // Lote que el servidor nunca aceptará: se descarta para no bloquear la cola
      Serial.printf("[ENVIO] Rechazado (400): %s. Se descarta el lote.\n", respuesta.c_str());
    } else {
      Serial.printf("[ENVIO] Fallo (%d): %s. %u lecturas quedan guardadas.\n", codigo, respuesta.c_str(), cantidad);
      return;
    }
#else
    Serial.printf(":\n%s\n", cuerpo.c_str());
#endif
    inicio = (inicio + n) % MAX_PENDIENTES;
    cantidad -= n;
  }
#if ETAPA >= 4
  Serial.println("[ENVIO] Al dia. Proximo envio en 5 minutos.");
#else
  Serial.println("[ENVIO] Enviado (simulado). Proximo envio en 5 minutos.");
#endif
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.printf("\n=== VERTEX - prueba de captura - ETAPA %d - %s ===\n", ETAPA, EQUIPO);

  Wire.begin(PIN_SDA, PIN_SCL);
  if (!rtc.begin()) {
    Serial.println("[RTC] No responde. Revisa SDA->D21, SCL->D22, VCC->3V3 y GND. Programa detenido.");
    while (true) delay(1000);
  }
  if (rtcPerdioHora()) {
    // Hora de compilación (Colombia, UTC-5) convertida a UTC; NTP la corrige si hay Wi-Fi.
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)) + TimeSpan(0, 5, 0, 0));
    Serial.println("[RTC] Habia perdido la hora: se puso la de compilacion.");
  }
  Serial.printf("[RTC] Hora actual (UTC): %s\n", isoUTC(rtc.now().unixtime()).c_str());

#if ETAPA >= 2
  conectarWifi(15000);
  if (WiFi.status() == WL_CONNECTED) ajustarHoraNTP();
#endif

#if ETAPA >= 3
  sondas.begin();
  haySonda = sondas.getDeviceCount() > 0;
  Serial.println(haySonda ? "[SONDA] DS18B20 detectada en D4."
                          : "[SONDA] Sin DS18B20: la temperatura ira como null.");
  ultimoMinuto = rtc.now().unixtime() / 60;
  Serial.println("[CAPTURA] Primera lectura al empezar el proximo minuto del RTC; envio cada 5 min.");
#endif
}

void loop() {
#if ETAPA == 1
  Serial.printf("[RTC] %s\n", isoUTC(rtc.now().unixtime()).c_str());
  delay(1000);
#else
  if (WiFi.status() != WL_CONNECTED && millis() - ultimoReintentoWifi > 30000) {
    ultimoReintentoWifi = millis();
    Serial.println("[WIFI] Reintentando con las redes registradas...");
    if (redes.run(5000) == WL_CONNECTED)
      Serial.printf("[WIFI] Conectado a \"%s\", senal %d dBm\n", WiFi.SSID().c_str(), WiFi.RSSI());
  }
  #if ETAPA == 2
  static uint32_t ultimoAviso = 0;
  if (millis() - ultimoAviso > 10000) {
    ultimoAviso = millis();
    Serial.printf("[RTC] %s  |  Wi-Fi: %s\n", isoUTC(rtc.now().unixtime()).c_str(),
                  WiFi.status() == WL_CONNECTED ? "conectado" : "sin conexion");
  }
  #else
  uint32_t minuto = rtc.now().unixtime() / 60;
  if (minuto != ultimoMinuto) {
    ultimoMinuto = minuto;
    tomarLectura(minuto * 60);
    if (minuto % MINUTOS_ENVIO == 0) enviarLote();
  }
  #endif
  delay(200);
#endif
}
