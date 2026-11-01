# agent-instructions

Agent instruction resolution and synchronization.

## 1. No discovery or sync of skills provided by dependencies.

- Problem: toolkit may publish a generated agent skill (toolkit backlog `documentation.2`), but nothing lists or syncs skills that dependencies provide.
- Fix: first check which conventions already distribute skills through packages; otherwise add a package-level skill declaration (in the spirit of `exports`) and an engrenage command listing available skills and keeping them up to date.
- Done when engrenage discovers and syncs skills declared by dependencies, or obsolete if an existing convention covers it.

## 2. Sync does not refresh skill and agent frontmatter.

- Problem: `engrenage sync agents` only refills the `@reference` body of installed skills and agents. Frontmatter (`description`, `model`, `disable-model-invocation`) is written once by `engrenage agents skills add` and never updated, so source changes to a skill's metadata do not reach existing projects. The pending `agent-skills-add` changeset says skills stay current on sync.
- Done when sync rewrites engrenage-owned frontmatter from the skill sources, or the changeset and docs state that frontmatter is init-only.
