---
"@auaust/engrenage": minor
---

- Run the PreToolUse guards as `metalbrain hook claude PreToolUse guardToolUse`, still blocking on Bash, Agent, Task and SendMessage
- Run the output limit as `metalbrain hook claude PostToolUse limitOutput`
- Remove `engrenage-hook claude PreToolUse`; run `engrenage sync` to update the hooks
