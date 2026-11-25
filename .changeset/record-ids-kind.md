---
"@auaust/engrenage": minor
---

- Give record entries IDs naming their kind, such as `BL-3fa9c1` and `FR-08d2e7`
- Rename former `YYMMDD-xxxx` entry IDs on sync, mapping each to its new ID in `.ai/renamed-ids.yml`
- Resolve former entry IDs passed to metalbrain commands, naming their new ID
- Add `metalbrain show` and `metalbrain close`, taking entry IDs of any kind
- Check every record kind in the `records` sync check, replacing the `backlog` check
