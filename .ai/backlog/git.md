# git

Git integration: ignore sources and repository files.

## 1. ESLint ignores only `.gitignore` files, missing `.git/info/exclude` and the global excludes file

- why: `git.ignoreFiles` (`src/tools/git/config/sections/gitSection.ts`) lists `.gitignore` files only, so ESLint lints `.claude/worktrees/`. `git.ignored`, which Vitest uses, lists existing files only: unfit for ESLint without a repository or for files created after load.
- want: ESLint reads both as patterns relative to the repository root.
