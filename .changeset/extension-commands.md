---
"@auaust/engrenage": patch
---

- Add the `cli.commands` slot: extensions contribute commands engrenage mounts after its own and before the project's scripts, each loaded only when a run names it
- Fail a contributed command whose extension is inactive before it runs, naming how to activate it, such as the package to install
