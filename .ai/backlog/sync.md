# Sync

## 1. Built-in `generate` targets run before extension ones, so one sync does not settle extension-generated domains

- why: `project/sync` orders built-ins first, so the `barrels` target (#446, `@debt` in `syncBarrelFiles.ts`) misses an extension-generated public domain or root entry until the next sync, breaking #436's one-sync promise.
- want: order `generate` targets by `reads`/`produces` edges, dropping resolved config keys between a source-tree producer and a structure reader; needs a `project/sync` ordering contract naming a source-tree product (`.ai/discarded.md` "source-tree sync products"). Rejected: hardcoding `barrels` last.
