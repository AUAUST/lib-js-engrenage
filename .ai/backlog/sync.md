# Sync

## 1. Built-in `generate` targets run before extension ones, so one sync does not settle extension-generated domains

- why: `project/sync` orders built-ins first; the `barrels` target (AUAUST/lib-js-engrenage#446, `src/tools/typescript/setup/syncBarrelFiles.ts`, `@debt`) misses a new public domain without `index.ts` or a whole-file generated root entry from an extension generator until the next sync, breaking #436's one-sync promise. AUAUST/lib-js-toolkit unaffected: fills only `barrels.exports`.
- want: order `generate` targets by `reads`/`produces` edges, dropping resolved config keys between a source-tree producer and a structure reader; needs a `project/sync` ordering contract naming a source-tree product (`.ai/discarded.md` "source-tree sync products"). Rejected: hardcoding `barrels` last.
