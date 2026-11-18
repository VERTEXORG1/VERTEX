import { createApp } from './app';
import { conectarConReintentos } from './shared/db';

// 3000 on the PC; the server sets PORT because Synerbot already uses 3000
const PORT = Number(process.env.PORT ?? 3000);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (ver apps/backend/.env.example)`);
  }
  return value;
}

async function main() {
  // Fail fast: the login cannot sign tokens without it
  requireEnv('JWT_SECRET');

  const config = {
    server: requireEnv('DB_SERVER'),
    port: Number(process.env.DB_PORT ?? 1433),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    // Default 15 s. sp_vx_resumen_estados over all the data takes ~2 s, but
    // the first call after SQL Server restarts (empty cache) can take ~10 s
    requestTimeout: 30_000,
    options: {
      encrypt: true,
      // Local SQL Server uses a self-signed certificate; set to "false"
      // against a server with a trusted certificate
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };

  // The port opens at once: until SQL Server answers, /health reports
  // db "sin conexión" and the data routes answer 503
  // HOST=127.0.0.1 on the server: only nginx (local) may reach the API
  const HOST = process.env.HOST ?? '0.0.0.0';
  createApp().listen(PORT, HOST, () => {
    console.log(`VERTEX backend escuchando en http://${HOST}:${PORT}`);
  });

  // Global pool (services use `new sql.Request()` on it), retried until it connects
  await conectarConReintentos(config);
}

main().catch((err: unknown) => {
  console.error('No se pudo iniciar el servidor:', err instanceof Error ? err.message : err);
  process.exit(1);
});
