# package-json

Published package contents and the `package.json` fields derived by the sync `package` target.

## 1. A stray file in `data` would ship in the published package.

- why: the `files` field, derived by the sync `package` target, lists `dist`, `data` and `src`, and the whole `data` directory is published. `.gitignore` already keeps such files (for example `.DS_Store`) out of the repository, so the risk is judged nearly impossible: a low-priority improvement to consider, not a bug.
- want: a decision on adding an `.npmignore` (or an equivalent mechanism) excluding stray files, and if so who owns it (engrenage's own repository only, or generated for consumers by the sync target).
- done: the safeguard is added or the decision not to is recorded; obsolete if the published `files` stop covering directories that can hold stray files.

## 2. Importing the root entry loads the whole configuration registry.

- why: `@auaust/engrenage` re-exports the eager `loadConfig` (#154), so a runtime import of any root helper evaluates every section's schemas and resolvers; a static peer-dependency import (`prettier`, `eslint-plugin-*`) or the config type generator (`json-schema-to-typescript-lite`) reachable from that graph would load or fail for every consumer.
- want: a decision on keeping the root light (lazy registry loading, a separate entry) or guarding its graph (a test importing the root without peers).
- done: the decision is recorded and applied.
