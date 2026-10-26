---
"@auaust/engrenage": minor
---

Native configs passed to `defineTsdownConfig` and `defineEslintConfig` can be callbacks, like those of `defineViteConfig` and `defineVitestConfig`: `(inlineConfig, context, engrenage) => config` for tsdown and `(engrenage) => config` for ESLint, sync or async. A callback returning nothing adds no config.
