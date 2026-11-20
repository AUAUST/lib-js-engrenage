# lefthook

Lefthook integration.

## 1. `lefthook.yml` is read and written at the project root

- site: `src/tools/lefthook/constants.ts:5`
- why: in a monorepo sub-package it belongs at the git root.
- want: the git root, or a documented limit (planning).

## 2. The Lefthook key is still named `local`

- sites: `src/tools/lefthook/constants.ts:10`
- why: the command runs every `everyone` gate step.
- done: needs planning: renaming makes sync remove the old key from existing `lefthook.yml` files.
