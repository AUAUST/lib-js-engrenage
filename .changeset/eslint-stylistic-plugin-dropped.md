---
"@auaust/engrenage": minor
---

- Remove the `@stylistic` ESLint plugin, its dependency and the `StylisticRules` type: Prettier owns layout, so configure or disable `@stylistic/*` rules by registering `@stylistic/eslint-plugin` yourself
