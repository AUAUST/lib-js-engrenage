# cli

The `engrenage` command line: init and sync flows and how they report failures.

## 1. Command errors are buried in stack traces and generic messages.

- Matter: errors carry no useful information. Valibot validation errors are buried under stack traces and generic messages. After init, probably at the install phase, the only output is `Error: pnpm install exited with code 1` followed by a minified stack trace from `dist/bin/engrenage.mjs`, without the output of `pnpm install`.
- Expected: command execution is wrapped to capture errors and present them readably: a clear message, the validation issues for schema errors, the failing subprocess output for `pnpm install`, and the stack trace only on request.
- Done when a failing init install and an invalid config each print an actionable message without a stack trace.
