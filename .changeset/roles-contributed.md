---
"@auaust/engrenage": minor
---

- Let extensions contribute role presets (`roles`) with the subpath exporting them, their environments and needed traits; `engrenage init` renders the generated config's role imports and lists from them
- Make role rule modules tool-agnostic `{ tool, rule }` modules, so ESLint applies only `tool: "eslint"` ones; a raw rule module (`{ create }`) is now rejected: wrap it with `defineRoleRule` from `@auaust/engrenage/eslint`
- Ship the `extension` role preset, carrying its `extension-imports` rule, from `@auaust/engrenage/eslint/roles`, which loads without ESLint
