---
"@auaust/engrenage": patch
---

- List an inactive extension's commands apart, from `--verbose` only, each with how to activate it, instead of warning on `--help` and on unknown commands
- Suggest unavailable commands for a close unknown name
- Add a `check` to `commandMount`, reporting a command unavailable with its reason without loading its declaration
