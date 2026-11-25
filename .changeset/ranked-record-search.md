---
"@auaust/engrenage": minor
---

- Rank `metalbrain <kind> search` results with a query in GitHub code search syntax, its arguments joined into one query
- Add `metalbrain search`, ranking the entries of every searchable record kind together
- Add `--limit`, `--offset` and `--text <raw>` to every record search
- Declare each record kind's searchable fields and their weights under `search` in `RecordKind`
- Change `searchRecords` to take several kinds and a query, returning ranked entries
