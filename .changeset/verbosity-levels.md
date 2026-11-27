---
"@auaust/engrenage": minor
---

- Add `--silent` and `--quiet` to every command, and make `--debug` and the program's debug variable print every debug report besides stack traces
- Reject two verbosity flags given together as a usage error
- Require a `debug` method on reporters passed to `runProgram`
