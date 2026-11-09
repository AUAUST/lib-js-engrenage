# lefthook

Lefthook integration.

## 1. `lefthook.yml` is read and written at the project root

- site: `src/tools/lefthook/constants.ts:3`
- why: in a monorepo sub-package it belongs at the git root.
- want: the git root, or a documented limit (planning).
