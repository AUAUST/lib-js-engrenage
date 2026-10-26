---
"@auaust/engrenage": minor
---

List inputs engrenage never mutates are typed read-only: the native configs of the definers, `syncBarrels` barrels, `createTsdownEntries` path aliases and the tsdown `bundle` option. `ScopeReferences` and `PathAliases` name the read-only lists of `ScopeReference` and `PathAlias`, and `resolvePathAliases` returns `PathAliases`.
