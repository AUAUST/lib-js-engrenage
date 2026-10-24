# Backlog

Deferred work. One entry per item: where, what is wrong, the intended fix.

## 1. Tooling

1. Vite native config loader warning.
   - Where: `vitest.config.ts`
   - Problem: Vite warns that the extensionless `./src/…` imports are unsupported by `configLoader: 'native'`, planned as the future default.
   - Fix: once Vite makes the native loader the default, import the config helpers with explicit extensions or through `#…` subpath imports.
