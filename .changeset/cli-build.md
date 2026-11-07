---
"@auaust/engrenage": minor
---

- **Breaking**: Write the GitHub workflows at the repository root, with the project directory as `working-directory`. Upgrade: run `engrenage sync`, then delete workflows left in a nested project's `.github/`.
- Write `preset` from `engrenage init`, except for the `other` project type
- Start commands without loading the config modules, and load the ESLint engine only when the VS Code sync reads its info rules: hooks that never read the config start in about 0.1s instead of 1.1s
- Stop shipping `.d.mts` declarations for bin entries
