---
"@auaust/engrenage": minor
---

Type `Rules` from the schemas of ESLint core and every plugin the shipped configuration registers (`@typescript-eslint`, `import-x`, `@stylistic`), so rule names autocomplete and rule options are checked. Each source is also exported on its own (`CoreRules`, `TypescriptEslintRules`, `ImportXRules`, `StylisticRules`). Projects using other plugins can type their rules by augmenting `Rules` from `@auaust/engrenage/eslint`; unknown rule names remain accepted.
