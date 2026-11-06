---
"@auaust/engrenage": minor
---

- Add the role contract field `effects` and the `structure.effects` option (`levels`, `modules`, `fallback`): a module of a ranked role imports at runtime only bindings declared in roles of its level or purer, and external modules ranked likewise. `levels` always contain `pure`, `confined` and `effectful` in that order; the presets rank `constants`, `enums`, `errors`, `ports`, `schemas` and `fixtures` pure and `utils` confined. `fallback` is unset, so unlisted modules stay unchecked.
- Add the `importEffects` convention, which follows each runtime binding through re-exports to its declaring file, and show each role's level in `engrenage structure` and the project map.
- Replace the `utils/` import rule by the rule of ranked roles; `utils/` now holds confined functions, so it may import other domains' `utils/` through their `index.ts`.
