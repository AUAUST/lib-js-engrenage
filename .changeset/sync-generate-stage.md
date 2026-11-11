---
"@auaust/engrenage": minor
---

- Add the `generate` sync stage, run before `write` and `check`: targets after it read the structure, aliases and source exports afresh, so one `sync` settles the files derived from generated sources
- Resolve the structure from the staged files, so it sees files written or removed earlier in the same run
- Add `forget` to loaded configs, dropping their resolved keys
