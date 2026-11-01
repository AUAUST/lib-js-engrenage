---
"@auaust/engrenage": minor
---

- Create the base `tsconfig.json` in `engrenage sync` when it is missing
- Stop `engrenage init` from writing tsconfig files; it creates `src/index.ts` for a new library and leaves the tsconfigs to sync
