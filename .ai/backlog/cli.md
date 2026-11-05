# cli

CLI workflow: command registration, subprocesses and process lifetime.

## 1. Subprocess and pnpm invocations are hand-written in several places

- sites: `bin/engrenage/init.ts:59` (`invokeCommand`), `src/tools/changesets/setup/createChangesetConfigStep.ts:15`, `src/workflows/cli/operations/createStepContext.ts:137`, `src/tools/pnpm/operations/installDependencies.ts:4`, `resolveLatestPnpm.ts:12`.
- why: callers check `spawnProcess` error and status by hand and build pnpm commands themselves.
- want: `spawnProcess` owns the check; `tools/pnpm` owns pnpm invocations.

## 2. CLI code guards or redoes work instead of owning it

- sites: `src/workflows/cli/operations/runProgram.ts:17` (resolves the config again after a failure), `defineCommand.ts:6` (guards `--debug` against double registration), `registerSubcommands.ts:7` (eager registration beside `registerLazySubcommands`: two contracts; needs a decision, see `coding-style.2`), `src/project/build/config/schemas/buildSchema.ts:29` (`resolveWithin` called only for its throw).
- want: fix directly, except the registration contract.

## 3. A tool command's child is never killed when its caller gives up

- site: `src/workflows/cli/operations/defineToolCommands.ts:47`
- why: the child sets the exit code later.
- want: kill the child on abandonment (debugging).
