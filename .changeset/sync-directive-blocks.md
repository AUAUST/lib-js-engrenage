---
"@auaust/engrenage": minor
---

- Let extensions declare block directives (`owns.directives`) and line markers (`owns.markers`), filled by the new `blocks` sync target, which replaces `barrel-blocks`
- Fail `sync` on an unknown `@` marker in a file a directive scans, naming the file and line
- Add a `fill` sync stage between `write` and `check`
