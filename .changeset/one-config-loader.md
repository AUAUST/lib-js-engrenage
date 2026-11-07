---
"@auaust/engrenage": minor
---

- `loadConfig` no longer validates the config: call `validateConfig(await loadConfig())` to reject unknown keys
- Load the config once per project root, shared by the CLI and the definers; `loadConfig.refresh(root)` drops it so the next load reads `engrenage.config.ts` again
