---
"@auaust/engrenage": minor
---

- Scope ESLint, `prettier:all` and the `tooling` environment to the declared environments instead of `**`; `tooling` defaults to the root config files and `tooling/`
- Replace `build.emptyOutDir` with `build.clean` (`"all"`, `"emitted"` or `false`), `"emitted"` removing only the files the previous build emitted
- Write the GitHub workflows at the repository root, with the project directory as `working-directory`
