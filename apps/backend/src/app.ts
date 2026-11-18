import cors from 'cors';
import express from 'express';
import { equiposRouter } from './domains/equipos/equipos.routes';
import { identityRouter } from './domains/identity/identity.routes';
import { estadoBase } from './shared/db';

/** Express app: JSON bodies, CORS, health check and the domain routes */
export function createApp() {
  const app = express();

  // On the server, nginx (local) forwards the visitor's IP in X-Forwarded-For;
  // without this, every login would come from 127.0.0.1 and the per-IP lockout
  // would block everyone at once. Direct local requests are unaffected.
  app.set('trust proxy', 'loopback');

  // Comma-separated list of allowed origins; defaults to the Vite dev server
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '100kb' }));

  // The backend answers; `db` is the real state of SQL Server (SELECT 1)
  app.get('/health', async (_req, res) => {
    res.json({ status: 'ok', db: await estadoBase() });
  });

  app.use('/api/identity', identityRouter);
  app.use('/api/equipos', equiposRouter);

  return app;
}
