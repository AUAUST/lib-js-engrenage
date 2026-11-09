# init

Init steps and their step context.

## 1. Step context overrides desync and cannot clear keys

- sites: `src/project/steps/ports/StepContext.ts:25`, `src/workflows/init/operations/createStepContext.ts:173`
- why: `setKey("preset", …)` bypasses the preset `getPreset` reads; an override resolving to `undefined` falls back to the config value.
- want: overriding one key updates every accessor of it; an override can clear a key.
