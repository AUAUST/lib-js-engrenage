---
"@auaust/engrenage": minor
---

- Let extensions contribute gate steps (`gate.steps`) to the `fixes`, `checks`, `commands` and `warnings` stages; the built-in steps run only while their extension is active, so the gate runs no ESLint, Prettier, Vitest or jscpd step and no `typecheck` when that tool is not installed
- Activate the Prettier extension only when Prettier is installed: without it, no formatter is selected, sync leaves `.prettierignore` alone and the `prettier` key is refused
