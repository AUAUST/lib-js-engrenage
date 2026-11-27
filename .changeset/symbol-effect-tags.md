---
"@auaust/engrenage": patch
---

- Add the `@effect <level>` doc tag and the `@pure`, `@printing`, `@confined`, `@observing` and `@effectful` shorthands, declaring a symbol's invocation level
- Hold a tagged function's own body to its tag, report a tag above its role's invocation ceiling, and charge invoking a tagged binding its tag, in `auaust/import-effects`
- Let a `docs.tags` contribution load a function of the config resolving its declarations
