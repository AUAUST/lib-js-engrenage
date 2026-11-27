---
"@auaust/engrenage": minor
---

- Accept loaders in a group's `subcommands`: functions loading commands only when no earlier subcommand or loader provides the name looked up
- Add `commandSource` to `future/nexus/cli`, for a loader to load commands yielding to earlier ones with `shadowable`
- Fail `--help`, bare `help`, a bare group and an unknown command as a configuration error when two loaders or subcommands provide one name and the later is not shadowable, or one loader provides a name twice
- Replace `CommandTokens["route"]` with `candidate`, the name tokens may route to
- Time source loading as its own run phase
