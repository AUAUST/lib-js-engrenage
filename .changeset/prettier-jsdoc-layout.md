---
"@auaust/engrenage": minor
---

- Move JSDoc layout from ESLint to Prettier, which now also wraps descriptions to the print width: `stylistic.jsdocLayout` is gone from the `defineEslintConfig` options, so options naming it now fail validation
- Replace `eslint-plugin-jsdoc` with `comment-parser` among the dependencies
