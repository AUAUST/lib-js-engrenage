---
"@auaust/engrenage": minor
---

- Add `scenario` to `command()` in `future/nexus/cli`, printing a run of the command or one below it for that scenario unless `--output` names another
- Pass the run's arguments and reporter to a program's failure handler
- Replace `writeHookContext`, `denyToolUse` and `blockStop` in `future/metalbrain/runtimes` with `toHookOutput`, returning the hook output for the run's printer
- Load `metalbrain`'s commands other than its hooks only when a run names no hook
- Fail a metalbrain hook whose program fails to load with exit code 1 instead of failing open with a message
