---
"@auaust/engrenage": minor
---

- Write and reference a shared tsconfig whenever an environment sharing it is active, so a project without `scripts` gets `tsconfig.scripts.json` for its tooling files without `tooling.tsconfig.inherits: false`
- Activate the tooling environment only when a tooling directory exists or a root file matches `tooling.files`
