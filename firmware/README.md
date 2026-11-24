# VERTEX · Firmware de prueba del dispositivo de captura

Montaje provisional (Etapa A): ESP32 DevKit de 30 pines + RTC DS3231 + sonda DS18B20.
Objetivo: comprobar el paquete que el ESP32 enviará al servidor. Por ahora el envío solo se muestra en el monitor serie.

| Archivo | Para qué |
|---|---|
| `conexiones.svg` | Diagrama pin a pin |
| `vertex_prueba_envio/vertex_prueba_envio.ino` | Programa para el ESP32 físico (`EN_WOKWI 0`) |
| `vertex_prueba_envio/secrets.h.example` | Plantilla del Wi-Fi; se copia como `secrets.h`, que no se sube a git |
| `wokwi/` | El mismo programa para el simulador (`EN_WOKWI 1`, RTC DS1307), con su `diagram.json` y `libraries.txt` |

## Conexiones (USB desconectado)

| ESP32 | DS3231 | DS18B20 |
|---|---|---|
| 3V3 (riel +) | VCC | rojo, y un extremo de la resistencia de 4,7 kΩ |
| GND (riel −) | GND | negro |
| D21 | SDA | |
| D22 | SCL | |
| D4 | | amarillo, y el otro extremo de la resistencia |

- Nunca VIN ni 5 V: con 5 V el DS3231 carga la pila CR2032, que no es recargable.
- Antes de alimentar el prototipo con batería, cortar una pata del diodo de carga del DS3231, el cilindro de vidrio junto a SCL.

## 1. Simulador (Wokwi)
1. Entrar a https://wokwi.com/projects/new/esp32.
2. Pegar `wokwi/sketch.ino` en `sketch.ino` y `wokwi/diagram.json` en `diagram.json`.
3. En **Library Manager → +**, agregar **RTClib**, **DallasTemperature** y **OneWire**.
4. Pulsar ▶. La compilación tarda 1–2 min en la cola gratuita.

## 2. ESP32 físico
1. Driver del USB: CP2102 de Silicon Labs, ya instalado. El ESP32 aparece como **COM5**.
2. Instalar **Arduino IDE 2** (arduino.cc/en/software).
3. En **Archivo → Preferencias → URLs adicionales**, poner `https://espressif.github.io/arduino-esp32/package_esp32_index.json`.
4. En **Herramientas → Placa → Gestor de placas**, instalar **esp32** de Espressif Systems.
5. En **Gestor de bibliotecas**, instalar **RTClib** (Adafruit), **OneWire** y **DallasTemperature**; aceptar las dependencias.
6. Copiar `secrets.h.example` como `secrets.h` y poner la red Wi-Fi. Debe ser de **2,4 GHz**: el ESP32 no usa 5 GHz.
7. Abrir `vertex_prueba_envio.ino` y elegir la placa **ESP32 Dev Module** y el puerto **COM5**.
8. Probar por etapas, cambiando `#define ETAPA`:
   - 1: la hora del RTC, cada segundo;
   - 2: Wi-Fi y ajuste de la hora por NTP;
   - 3: lecturas cada minuto y lote cada 5 min.
9. **Subir (→).** Si se queda en `Connecting....`, mantener pulsado **BOOT** hasta que empiece a escribir.
10. Abrir el **Monitor serie** a **115200** baudios.

## Qué se ve (probado en Wokwi el 23/11/2026)
```
=== VERTEX - prueba de captura - ETAPA 3 - CERO-010 ===
[RTC] Hora actual (UTC): ...
[WIFI] Conectado. IP 10.10.0.2, senal -87 dBm
[NTP] Hora de internet 2026-11-23T16:56:43Z (diferencia con el RTC: 18000 s)
[NTP] RTC ajustado.
[SONDA] DS18B20 detectada en D4.
[LECTURA] {"equipo":"CERO-010","seq":1,"event_time":"2026-11-23T16:57:00Z","lecturas":{"CORRIENTE_MOTOR":0.000,"TEMPERATURA_MOT":22.00}}  (pendientes: 1)
...
[ENVIO] Lote de 4 lecturas (seq 1 a 4):
```
- Las horas van en UTC: Colombia + 5 h.
- Si se apaga el Wi-Fi, aparece `[ENVIO] Sin Wi-Fi: N lecturas quedan guardadas`, y al volver salen todas en orden.

| Mensaje | Causa |
|---|---|
| `[RTC] No responde` | SDA y SCL cruzados, o falta GND o 3V3 |
| `Sin DS18B20` | Falta la resistencia de 4,7 kΩ, o el cable amarillo no está en D4 |
| Temperatura −127 o `null` | Mal contacto en la sonda |
