# cli

Command definitions, registration and program runs.

## 1. Command registration state is shared or re-derived

- sites: `src/workflows/cli/operations/configureCommand.ts:3`, `defineGroup.ts:22`, `forwardingCommands.ts:3`, `runProgram.ts:19`
- why: Commander exposes no action getter, so mounting wraps `action` to detect a call; the help command joins a module-global forwarding registry only to skip `--debug`, linking `defineToolCommand` to `createProgram` through shared mutable state; a failing run resolves the config again.
- want: the definition contract states whether a command forwards arguments and takes `--debug`; no shared mutable registry; the failing command's config reused.
