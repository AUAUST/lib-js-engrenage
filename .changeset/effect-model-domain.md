---
"@auaust/engrenage": minor
---

- Rank a module entry's own level under `level` instead of `default` in `structure.effects.modules`, so `symbols.default` alone ranks the default export
- Give each custom level in `structure.effects.levels` as `{ name, purpose }`, and describe it by that purpose in project maps
- List the configured effect levels in project maps instead of the default ones
- Rank an exact module specifier before any glob, whatever their order
- Rank an export by the first entry listing it in `symbols`, configured or shipped, before its module's level
