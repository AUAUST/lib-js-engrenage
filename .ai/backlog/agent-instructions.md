# agent-instructions

Agent instruction resolution and synchronization.

## 1. No discovery or sync of skills provided by dependencies.

- Problem: toolkit may publish a generated agent skill (toolkit backlog `documentation.2`), but nothing lists or syncs skills that dependencies provide.
- Fix: first check which conventions already distribute skills through packages; otherwise add a package-level skill declaration (in the spirit of `exports`) and an engrenage command listing available skills and keeping them up to date.
- Done when engrenage discovers and syncs skills declared by dependencies, or obsolete if an existing convention covers it.

## 2. Sync does not refresh skill and agent frontmatter.

- Problem: `engrenage sync agents` only refills the `@reference` body of installed skills and agents. Frontmatter (`description`, `model`, `disable-model-invocation`) is written once by `engrenage agents skills add` and never updated, so source changes to a skill's metadata do not reach existing projects. The pending `agent-skills-add` changeset says skills stay current on sync.
- Done when sync rewrites engrenage-owned frontmatter from the skill sources, warns when local and source frontmatter differ, or the changeset and docs state that frontmatter is init-only.

## 3. No tool authorization presets for agent settings.

- Problem: tools irrelevant to a project (browser preview, iOS Simulator, Chrome, visualization, artifacts, notebooks) are denied by hand in this repository's `.claude/settings.json`. Every project repeats that list, and the docs connector entry is an account-specific ID checked into a shared file.
- Context: `syncClaudeSettings` only merges the edit hook today. Engrenage presets already describe the project kind (library, app, browser runtime), which decides which tools help.
- Expected: engrenage manages `permissions.deny` (and Codex equivalents where they exist) from tool authorization presets derived from the project's engrenage presets, overridable in `engrenage.config.ts` to allow or deny more, with account-specific entries kept out of shared files.
- Done when `engrenage sync claude` writes preset-derived tool permissions, project overrides apply, and this repository's hand-written list is replaced by them.

## 4. Issue-reading commands in the skills omit comments, and plain `gh issue view --comments` fails.

- Problem: `gh issue view <n> --comments` fails with a GraphQL error on the deprecated Projects (classic) cards. `data/agents/skills/issue-implementation.md` and `data/agents/skills/issue-planning.md` read issues with `--json title,body,state,labels`, which avoids the error but returns no comments, so maintainer decisions made in comments are missed.
- Context: `gh issue view <n> --repo <owner>/<repo> --json title,body,state,labels,comments` works (checked on issue 85).
- Expected: the skills that read issues also read their comments through the `--json` form and state that `--comments` must not be used.
- Done when the issue-reading commands in the shared skills include comments, or obsolete if `gh` stops querying Projects (classic) cards.
