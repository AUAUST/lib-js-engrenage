# Sync

## 1. Built-in `generate` targets run before extension ones, so one sync does not settle extension-generated domains

- why: `project/sync` orders built-ins first, so the `barrels` target (#446, `@debt` in `syncBarrelFiles.ts`) misses an extension-generated public domain or root entry until the next sync, breaking #436's one-sync promise.
- want: order `generate` targets by `reads`/`produces` edges, dropping resolved config keys between a source-tree producer and a structure reader; needs a `project/sync` ordering contract naming a source-tree product (`.ai/discarded.md` "source-tree sync products"). Rejected: hardcoding `barrels` last.

## 2. Sync deletes engrenage's moved skills until `pnpm build` writes their package export

- why: #473; `pnpm build`, not sync, writes `package.json` exports from `data.exports`, so a sync run before the new `./extensions/…` export exists resolves no template and removes the synced skills.
- want: sync writes the exports it resolves templates through, or fails clearly on a missing one.

## 3. The first sync after adding a built-in extension renders generated files from the old built-ins list

- why: #473; the generated built-ins list is read before sync regenerates it, so a second sync is needed.
- want: one sync settles a new built-in extension; related to sync.1.
