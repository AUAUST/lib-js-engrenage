---
"@auaust/engrenage": minor
---

- Add the `barrel-blocks` sync target, which fills each `// @barrel <role>` block in the `index.ts` and `entry.ts` files of every environment, keeping the hand-written lines around it, and which `sync --check` checks. A block lists the role's modules per its export contract: those of the barrel's own domain or, for a `collected` role, its public modules across the environment, where default exports sharing a file name take the camelCase of their domain path. `// @barrel domains` in an environment's root entry re-exports what the generated root entry would. An unknown role fails sync
- Stop filling `// @barrel <glob> <mode>` blocks: name the role instead
- Remove `syncBarrels` and the `BarrelMode` type from `@auaust/engrenage/typescript`
- Let `syncBlocks` fillers and `FileSync.update` return a promise; `syncBlocks` now returns one
