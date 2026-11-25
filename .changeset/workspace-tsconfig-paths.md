---
"@auaust/engrenage": patch
---

- Clear the inherited `paths` in workspace tsconfigs, so a workspace resolves only its own `#…` imports
- Remove a tsconfig `compilerOptions` entry once it leaves the config, and fail `sync --check` while it remains
