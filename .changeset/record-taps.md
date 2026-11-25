---
"@auaust/engrenage": minor
---

- Write a `created` UTC time on every record entry, and backfill it on sync from former IDs
- Add `tap <id…> [--note <text>]` to the backlog, friction, discarded and missing commands
- Show tap counts in `list` and `search` lines, taps in `show`, and count taps in `stats`
- Order search ties by newest `created`
- Merge every record file by union through the synced `.gitattributes`
- Reject entries without `created` and taps naming no entry in the record check
