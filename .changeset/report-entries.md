---
"@auaust/engrenage": minor
---

- Add report entries (line, title, list, table, tree, stack and completion) with semantic span styles, a `Printer` port and the dense printer, exported from `future/nexus/cli`
- Accept entries in every `Reporter` method and add `complete` for the completion line, shown under `--quiet`
- Replace the `reporter` option of `runProgram` with `printer`
- Print the gate's passing line under `--quiet`
