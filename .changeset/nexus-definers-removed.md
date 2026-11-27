---
"@auaust/engrenage": minor
---

- Remove `defineCommand`, `defineLazyCommand`, `defineGroup` and `defineChainedCommand` from `future/nexus/cli`; declare commands with `command`, `argument` and `option` instead
- Remove the `CommandDefinition`, `CommandParameters`, `DefaultActionParameters` and `ExtendCommand` types from `future/nexus/cli`
- Make `createProgram` take only a command declaration
