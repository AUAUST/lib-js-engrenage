---
paths:
  - "data/metalbrain/**"
---

# Agent fragments

- `data/metalbrain/` holds the shared fragments: AGENTS.md sections in `sections/`, `.claude/rules` files in `rules/`, skills and their agents in `skills/`, and the starting content of the agent files engrenage creates in `templates/`.
- A skill's supporting files: `skills/<skill>/<file>.md`, without frontmatter, which sync would copy as text. Sync installs each beside the skill; reach it from the skill with `<!-- @skill-file <file>.md -->`, which sync renders as the installed file's path and fails on a name the skill does not ship.
- `extension: <name>` in a fragment's frontmatter ships the fragment, with its supporting files, only while that extension is active.
- Keep every fragment project-agnostic: no paths, commands, tools or documents specific to one repository.
- After changing a fragment, run `pnpm engrenage sync agents`, which also updates this repository's own copies. It updates only installed skills: install a new skill first with `pnpm engrenage agents skills add <name>`.
