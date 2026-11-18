---
"@auaust/engrenage": patch
---

- Fix heredoc bodies read by agent hooks: keep a quoted delimiter's body raw, unescape only `\$`, `` \` ``, `\\` and line continuations otherwise, and strip leading tabs after `<<-`
- Fix shell syntax error columns counting bytes instead of characters
