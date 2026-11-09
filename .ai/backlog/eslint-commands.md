# eslint-commands

engrenage's ESLint commands and the arguments they pass.

## 1. `eslint fix` looks for `eslint-suppressions.json` in `process.cwd()`, not at the project root

- why: `resolveEslintFixArguments` (`src/tools/eslint/operations/resolveEslintFixArguments.ts`) receives the arguments only, and `bin/engrenage/actions/eslintFix.ts` loads no config, so a run from a subdirectory skips `--prune-suppressions`.
- want: read the location from the `eslint-suppressions.json` file resource (#343) through `resources.path`, which needs the action to load the config.
- done: no ESLint command resolves a project file from `process.cwd()`.
