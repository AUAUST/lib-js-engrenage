# typescript

TypeScript declarations engrenage generates for projects.

## 1. Host API declarations for isomorphic source.

- Where: `src/typescript/setup/syncEnvFile.ts`, `src/config/config/schemas/configSchema.ts`
- Problem: with `types: []` and no `DOM` lib (`library.json` and the baseline snippets), source loses host APIs outside ECMAScript that every baseline runtime has (WinterTC timers, `performance.now`, `crypto.getRandomValues`). Adding `DOM` or `node` types lets platform-specific APIs back in.
- Fix: ship small declaration groups (timers, performance, crypto, added on demand), selected in `engrenage.config.ts` (for example `typescript.host`), generated into a separate file (for example `env.host.d.ts`) included only by the source config: next to `@types/node` they fail with TS2403. Timer handles stay opaque and public declarations never expose host-specific types. Depends on `configuration.4`.
- Done when the selected groups are generated and checked, toolkit's source checks with `types: []`, and no test or dist program sees them.
