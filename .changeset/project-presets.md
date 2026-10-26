---
"@auaust/engrenage": minor
---

`engrenage.config.ts` accepts `presets`, a list of built-in preset names (for now only `"library"`), resolved as `config.presets` (default `[]`). The names live in `presets` from `@auaust/engrenage/config/constants`, and `Preset` and `Presets` are exported from `@auaust/engrenage/config`. ESLint conventions can list the presets that enable them: such a convention is on by default only when one of its presets is active, and ESLint options still turn it on or off individually or by category.

A new `performance` ESLint category holds conventions enabled by the `library` preset in source directories: `noToolkitRoot` and `noPrimitiveKitRoot` report root imports of `@auaust/toolkit` and `@auaust/primitive-kit` in favor of their subpath entries, `noValibotNamespace` reports `import * as v from "valibot"`, `noZodClassic` reports imports of `zod` in favor of `zod/mini`, and `noZodNamespace` reports namespace, default and `z` imports from `zod/mini` in favor of named imports.
