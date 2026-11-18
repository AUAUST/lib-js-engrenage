---
"@auaust/engrenage": patch
---

- Report sync, init, gate and tool command messages through the config's reporter instead of the console
- Show the agent findings `sync` reports only with `--verbose`, unless they are conflicting, disabled or unsupported
- Return sync target warnings in the gate's `sync --check` output instead of printing them
