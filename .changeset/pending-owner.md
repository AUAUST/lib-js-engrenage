---
"@auaust/engrenage": patch
---

- Add an `owner` field to pending log entries, naming the issue, backlog entry or task they belong to: `pending add` requires `--owner`, earlier entries stay valid without one
- Filter `pending list` by `--owner`, and `pending search` by `owner:<value>`
- Drop `tap` and `merge` from the pending commands, and hint `close` instead of `merge` on a similar pending entry
