---
"@auaust/engrenage": minor
---

- Add `metalbrain friction|discarded|pending add|list|search|show|close|stats`, storing each log as `.ai/<kind>.yml`
- Migrate `.ai/friction.md` and `.ai/discarded.md` to YAML on sync once no instruction file names them
- Add the `agents.wordCaps.logEntry` word cap
- Declare each record field in `future/metalbrain/records` as `{ type, description }`, and accept one-file kinds through `location.file` and counting by `groupBy` through `countRecords`
