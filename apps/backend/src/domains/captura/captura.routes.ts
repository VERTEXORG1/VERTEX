import { Router } from 'express';
import { recibirLote } from './captura.controller';

export const capturaRouter = Router();

// Authenticated by the device key (X-Dispositivo + Bearer), not by a user token
capturaRouter.post('/lotes', recibirLote);
