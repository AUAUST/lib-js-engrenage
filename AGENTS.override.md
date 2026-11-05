# Codex instructions

This file is intended for OpenAI Codex. Other agents, including Claude Code, must ignore this file and use their own instruction entry points.

Codex loads this file instead of the root AGENTS.md. Before working, read and follow ./AGENTS.md as the shared project instructions.

## Rule mapping

Paths below are relative to the project root. Before editing a file, read and follow every rule whose glob matches that file. Read rules marked "All files" before any work. Multiple matching rules apply together. The paths frontmatter in each rule defines its scope; do not treat scoped rules as project-wide instructions.

<!-- @rules -->

| Matching glob | Rule to read |
| --- | --- |
| <code>.ai/backlog/*.md</code> | <code>.claude/rules/backlog.md</code> |
| <code>.changeset/**</code> | <code>.claude/rules/changesets.md</code> |
| <code>**/*.ts</code> | <code>.claude/rules/code-style.md</code> |
| <code>**/*.ts</code> | <code>.claude/rules/prefer-primitive-kit.md</code> |
| <code>**/*.ts</code> | <code>.claude/rules/prefer-toolkit.md</code> |
| <code>bin/**</code> | <code>.claude/rules/project-map/bin.md</code> |
| <code>scripts/**</code> | <code>.claude/rules/project-map/scripts.md</code> |
| <code>src/**</code> | <code>.claude/rules/project-map/src.md</code> |
| <code>tests/**</code> | <code>.claude/rules/project-map/tests.md</code> |
| <code>tooling/**</code> | <code>.claude/rules/project-map/tooling.md</code> |
| All files | <code>.claude/rules/debt-markers.md</code> |
| All files | <code>.claude/rules/git.md</code> |
| All files | <code>.claude/rules/no-attribution.md</code> |
| All files | <code>.claude/rules/project-map.md</code> |

<!-- @end -->
