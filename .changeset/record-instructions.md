---
"@auaust/engrenage": patch
---

- Have agents record a missing capability for each piece of generic logic they write or work around lacking
- Teach agents one command pattern for every record kind: `add`, `update`, `tap`, `merge`, `search`, `list`, `stats`, `show` and `close`
- Have agents tap a known entry instead of adding one, and act on the backlog entries the commit gate lists as related
- Count every agent log among the records git commits with the next task, and curate missing capabilities like friction
