---
"@auaust/engrenage": minor
---

- Run `metalbrain` on nexus's own engine, resolving and validating each run before its action loads
- Name the full command path in every chained `metalbrain` invocation, as in `friction add … --next friction add …`
- Print `metalbrain` usage errors through the run's printer, without Commander's `error: ` prefix
- Fail a `metalbrain hook` run open whatever run options precede `hook`, without echoing its usage errors to stderr
- Hand a program's failure handler the command path the run resolved to and the default report
- Mark repeatable `metalbrain` options as such in their help
