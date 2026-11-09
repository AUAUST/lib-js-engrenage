# package-json

Published package contents and the `package.json` fields derived by the sync `package` target.

## 1. A stray file in `data` would ship in the published package.

- why: the `files` field, derived by the sync `package` target, lists `dist`, `data` and `src`, and the whole `data` directory is published. `.gitignore` already keeps such files (for example `.DS_Store`) out of the repository, so the risk is judged nearly impossible: a low-priority improvement to consider, not a bug.
- want: a decision on adding an `.npmignore` (or an equivalent mechanism) excluding stray files, and if so who owns it (engrenage's own repository only, or generated for consumers by the sync target).
- done: the safeguard is added or the decision not to is recorded; obsolete if the published `files` stop covering directories that can hold stray files.

## 2. The "No package.json found" guard repeats in five places

- sites: `bin/engrenage/pnpm/actions/upgrade.ts:41`, `src/tools/changesets/setup/syncChangesetConfig.ts:53`, `src/tools/pnpm/setup/createPnpmStep.ts:22`, `src/tools/tsdown/operations/createTsdownConfig.ts:115`, `src/workflows/init/operations/createStepContext.ts:66`
- want: the resolved config exposes a required package.json path.
