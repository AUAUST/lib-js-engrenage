---
"@auaust/engrenage": patch
---

- Add `languages` to `roles` contributions: a role preset is a default of a top-level namespace only when an environment placed on it selects one of them
- Default the built-in role presets only in namespaces whose environments select `typescript`
