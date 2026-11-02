# agent-instructions

Agent instruction resolution and synchronization.

## 1. No discovery or sync of skills provided by dependencies.

- Problem: toolkit may publish a generated agent skill (toolkit backlog `documentation.2`), but nothing lists or syncs skills that dependencies provide.
- Fix: first check which conventions already distribute skills through packages; otherwise add a package-level skill declaration (in the spirit of `exports`) and an engrenage command listing available skills and keeping them up to date.
- Done when engrenage discovers and syncs skills declared by dependencies, or obsolete if an existing convention covers it.

## 2. No tool authorization presets for agent settings.

- Problem: tools irrelevant to a project (browser preview, iOS Simulator, Chrome, visualization, artifacts, notebooks) are denied by hand in this repository's `.claude/settings.json`. Every project repeats that list, and the docs connector entry is an account-specific ID checked into a shared file.
- Context: `syncClaudeSettings` only merges the edit hook today. Engrenage presets already describe the project kind (library, app, browser runtime), which decides which tools help.
- Expected: engrenage manages `permissions.deny` (and Codex equivalents where they exist) from tool authorization presets derived from the project's engrenage presets, overridable in `engrenage.config.ts` to allow or deny more, with account-specific entries kept out of shared files.
- Done when `engrenage sync claude` writes preset-derived tool permissions, project overrides apply, and this repository's hand-written list is replaced by them.
