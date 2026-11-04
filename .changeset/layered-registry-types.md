---
"@auaust/engrenage": patch
---

- Rename the generated `Config` type to `ConfigInput` and the `ConfigInput` helper (a value or a possibly async function) to `Resolvable`
- Move the `ResolvedAgents` type from `@auaust/engrenage/config` to `@auaust/engrenage/agents`
- Move the `ResolvedGit`, `ResolvedGithub`, `ResolvedPrettier` and `ResolvedVscode` types from `@auaust/engrenage/config` to their tool entries
- Rename `ResolvedConfig` to `ProjectConfig`: `loadConfig` of `@auaust/engrenage/config` resolves the project sections only and ignores unknown keys; the sections of Agents, Git, GitHub, Prettier and VS Code (`Resolved…` types) moved to their tool entries
