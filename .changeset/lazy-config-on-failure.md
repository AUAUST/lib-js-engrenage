---
"@auaust/engrenage": patch
---

- Start commands without loading the config modules, which only the error path reads: Claude Code hooks that never read the config run in about 0.1s instead of 1.1s
