---
"@auaust/engrenage": minor
---

- Add `directorySource` to `future/nexus/cli`, loading a command per subdirectory of the given directories: one holding the entry file mounts the program it default-exports in the current run, one holding only the executable file runs it as its own process with the rest of argv
- Add `commandMount` to `future/nexus/cli`, a subcommand whose name and aliases are known up front and whose declaration loads only on a match, named by its origin in configuration errors
- Add `launch` to `future/nexus/cli`, the only call of a program's executable module
- Add `kind: "program"` to `ProgramDeclaration`
