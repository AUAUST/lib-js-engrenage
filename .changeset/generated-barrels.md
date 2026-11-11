---
"@auaust/engrenage": minor
---

- Add the `barrels` sync target, which writes from the project structure, with a generated header: the `entry.ts` of each public domain without `index.ts`, re-exporting its `collected` public roles; one `index.ts` per directory of each `index: true` role; and the environment's root entry unless it exists without that header, re-exporting each public domain's entry, as a namespace named after its package subpath by default, and each global `index: true` role's barrel declaring `reexport`. It deletes the barrels it generated once their domain or role disappears, and `sync --check` checks them
- Add the domain options `reexport` (`namespace`, `flat` or both as a list: how the root entry re-exports the domain) and `public` (whether the domain is a package entry before its `entry.ts` exists; `false` fails beside an existing `entry.ts`), on `domains` entries and `.domain.json`
- Add the role contract entry `reexport`, taken only by a global role with `index: true`: how the root entry re-exports the role's barrel; unset, it does not
- Add the `barrels.exports` slot, through which an extension adds or renames the exports of each generated barrel (aliases, derived names); its `BarrelExport`, `BarrelExportsEntry` and `BarrelExportsResolver` contracts and `ReexportMode` are exported from `@auaust/engrenage/extensions`, marked experimental
