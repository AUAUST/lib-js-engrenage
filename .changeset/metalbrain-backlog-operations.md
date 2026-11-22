---
"@auaust/engrenage": patch
---

- Add `metalbrain backlog categories`, `list [category]`, `search <keyword>` and `show <id>`
- Add `metalbrain backlog update <id>` with `--title`, `--sites`, `--why`, `--want`, `--done` and `--unset`, writing nothing when the entry breaks the backlog file schema
- Add `metalbrain backlog move <id> <category>`, keeping the entry's ID
- Add `metalbrain backlog close <id>`, deleting a category with its last entry
- Export `findRecord`, `listRecords`, `searchRecords`, `updateRecord`, `moveRecord`, `closeRecord` and `readRecordIndex` from `@auaust/engrenage/future/metalbrain/records`
