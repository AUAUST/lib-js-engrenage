---
"@auaust/engrenage": minor
---

- Store backlog categories as `.ai/backlog/<category>.yml` with an ID per entry, sync converting legacy `.md` categories and rewriting their references
- Render the backlog index's category list from each category's `purpose`
- Rename the `backlog-sites` sync check `backlog`, now rejecting entries that break the backlog file schema, sites naming no file and entries over their word budget
- Drop the gate's warning on long backlog entries
- Attribute runs from `Backlog:` brief lines carrying entry IDs
