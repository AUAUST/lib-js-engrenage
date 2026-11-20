# cli

Command definitions, registration and program runs.

## 1. Command registration state is shared or re-derived

- sites: `src/workflows/cli/operations/configureCommand.ts:3`, `src/workflows/cli/operations/defineGroup.ts:22`, `src/workflows/cli/operations/forwardingCommands.ts:3`, `src/workflows/cli/operations/runProgram.ts:44`
- why: Commander exposes no action getter, so mounting wraps `action` to detect a call; the help command joins a module-global forwarding registry only to skip `--debug`, linking `defineToolCommand` to `createProgram` through shared mutable state; a failing run resolves the config again.
- want: the definition contract states whether a command forwards arguments and takes `--debug`; no shared mutable registry; the failing command's config reused.

## 2. Every action repeats the validated config load

- sites: `src/workflows/cli/operations/getRunContext.ts:4`, `bin/engrenage/actions/vite.ts:5`
- why: each bin and scripts action calls `loadValidatedConfig(…, { reporter: getRunContext().reporter })`, cloned across actions (jscpd: `structure`, codegen `editions`, `rules`, `schemas`); the Vite action repeats `ensureSourceConfigLoader` of `#tools/vitest`.
- want: a run-scoped config loader in the run context; one source config loader.

## 3. The run context and abort signal stay optional

- sites: `src/workflows/cli/operations/createCommandDefinition.ts:105`, `src/workflows/cli/operations/createCommandDefinition.ts:106`
- why: tests run commands outside `runProgram`; past the check, prompts, config loads and writes ignore the abort signal.
- want: the context required through `getRunContext`; the signal honoured by prompts, loads and writes.

## 4. Program wiring leans on Commander internals and copies

- sites: `src/workflows/cli/operations/createProgram.ts:20`, `src/workflows/cli/operations/runProgram.ts:35`, `src/workflows/cli/operations/defineCommand.ts:1`
- why: the root definition's `commandExtension` never runs, so tests wrap commands in a group; the `error: ` prefix Commander adds is stripped by text; `defineCommand` and `defineLazyCommand` clone each other (jscpd).
- want: extensions applied at the root; messages without the prefix; one command definer. Related: #385 moves the definers.

## 5. Tool runs and linked sources resolve against the wrong base

- sites: `src/workflows/cli/operations/runTool.ts:14`, `src/workflows/cli/operations/enableLinkedSource.ts:30`
- why: a glob given from a subdirectory still matches from the root; reading the link record through the pnpm surface loads built pnpm, GitHub and Git modules before the run defers to the sources.
- want: globs resolved from the cwd; the record read without loading built modules.
