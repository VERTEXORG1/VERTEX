import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // New *.spec.ts files must be added here
    include: ['src/domains/identity/tests/**/*.spec.ts', 'src/__tests__/e2e/auth-permissions.e2e.spec.ts'],
    // Test-only signing key; the real one comes from apps/backend/.env
    env: { JWT_SECRET: 'clave-solo-para-pruebas' },
    // bcrypt with 12 rounds: a few hundred ms per hash
    testTimeout: 30_000,
  },
});
