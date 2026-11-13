# Sync

## 1. Built-in `generate` targets run before extension ones, so one sync does not settle extension-generated domains

- why: `project/sync` orders built-ins first; the `barrels` target (AUAUST/lib-js-engrenage#446, `src/tools/typescript/setup/syncBarrelFiles.ts`, `@debt`) misses a new public domain without `index.ts` or a whole-file generated root entry from an extension generator until the next sync, breaking #436's one-sync promise. AUAUST/lib-js-toolkit unaffected: fills only `barrels.exports`.
- want: order `generate` targets by `reads`/`produces` edges, dropping resolved config keys between a source-tree producer and a structure reader; needs a `project/sync` ordering contract naming a source-tree product (`.ai/discarded.md` "source-tree sync products"). Rejected: hardcoding `barrels` last.

## 2. Sync crashes on load when a generated barrel imports a deleted module

- why: `engrenage sync` loads the ESLint conventions through their generated barrels before the `barrels` target regenerates them, so deleting a convention file crashes sync, and a new convention category needs its barrel written by hand first (#439). The only way out is hand-editing generated files, against project rules. Seen in AUAUST/lib-js-engrenage#432.
- want: sync must regenerate barrels, or discover conventions without them, before loading anything that imports them.
