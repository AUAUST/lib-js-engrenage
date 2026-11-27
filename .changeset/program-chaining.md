---
"@auaust/engrenage": minor
---

- Chain invocations of any chainable commands in every program on nexus's engine, each running in its own run context, the first failure, thrown or by exit code, stopping the rest while earlier ones keep their effects
- Add `chainable: false` to `command` in `future/nexus/cli`, making a command and every command below it unchainable, as metalbrain's hooks and forwarding commands are
- Remove `runInvocations`, `InvocationsError` and `InvocationFailure` from `future/nexus/cli`
