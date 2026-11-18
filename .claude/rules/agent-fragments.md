---
paths:
  - "data/agents/**"
---

# Agent fragments

- `data/agents/` holds the shared fragments: AGENTS.md sections in `sections/`, `.claude/rules` files in `rules/`, skills and their agents in `skills/`, and the starting content of the agent files engrenage creates in `templates/`.
- Keep every fragment project-agnostic: no paths, commands, tools or documents specific to one repository.
- After changing a fragment, run `pnpm engrenage sync agents`, which also updates this repository's own copies. It updates only installed skills: install a new skill first with `pnpm engrenage agents skills add <name>`.
