---
"@auaust/engrenage": patch
---

- Report sync, init, gate and tool command messages through the config's reporter instead of the console
- Show the agent findings `sync` reports only with `--verbose`, unless they are conflicting, disabled or unsupported
- Show the progress lines of tool commands, such as `Linting...`, only with `--verbose`
- Show the `All good!` line of tool commands only with `--verbose`, on stderr, so their stdout holds only the tool's output
- Return sync target warnings in the gate's `sync --check` output instead of printing them
