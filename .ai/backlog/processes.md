# processes

Spawned processes, binary and module resolution.

## 1. Synchronous resolution and parsing calls

- sites: `src/foundation/processes/operations/resolveBinary.ts:23`, `src/tools/changesets/setup/syncChangesetConfig.ts:16`, `src/tools/agents/operations/resolveAgentReference.ts:25`, `src/tools/prettier/operations/loadPrettier.ts:17`, `src/project/tsconfig/operations/createTsconfig.ts:75`
- why: Node has no promise-based module resolution; Prettier loads through `require`; the TypeScript config parser probes each `extends` level before the real parse.
- want: per site, an async alternative (`import()`, one async tsconfig read) or an accepted limit (planning).

## 2. Process and git failures lose or repeat output handling

- sites: `src/foundation/processes/operations/runProcess.ts:6`, `src/tools/git/operations/readHead.ts:4`
- why: the process error drops the stderr a caller captured; `readHead` repeats `runGit`'s failure handling to accept an unborn HEAD.
- want: the error keeps the captured stderr; one git failure handler accepting an unborn HEAD.
