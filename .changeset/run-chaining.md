---
"@auaust/engrenage": minor
---

- Split every run of a program on nexus's engine on bare `--next` tokens, before `--`, each invocation naming its full command path
- Resolve every invocation before any action loads, naming the invocation of each usage error
- Reserve `--next`, refusing a command declaring it, so a forwarding command such as `engrenage vitest` receives a bare `--next` only after `--`
- Apply run options from any invocation to the whole run, failing on conflicting verbosity flags or differing `--output` values
- List `--next` and its syntax among the run options of a program's help
