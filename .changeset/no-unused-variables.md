---
"@auaust/engrenage": minor
---

New `imports.noUnusedVariables` convention: unused local variables, functions and types are reported as warnings (`unused-imports/no-unused-vars`), so imports only they use can be removed too. The VS Code sync shows them as info through `eslint.rules.customizations`. Turn it off with `imports: { noUnusedVariables: false }`.
