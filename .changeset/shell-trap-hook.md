---
"@auaust/engrenage": patch
---

- Refuse Claude Bash commands passing an unquoted glob, a word starting with `=`, `sed -i` without `''`, `timeout`, or `pnpm engrenage eslint:fix` without files, with the fix in the message
