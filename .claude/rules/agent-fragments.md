---
paths:
  - "data/metalbrain/**"
---

# Agent fragments

- `data/metalbrain/` holds the shared fragments: AGENTS.md sections in `sections/`, `.claude/rules` files in `rules/`, skills and their agents in `skills/`, and the starting content of the agent files engrenage creates in `templates/`.
- A skill's supporting files: `skills/<skill>/<file>.md`, without frontmatter, which sync would copy as text. Sync installs each beside the skill; reach it from the skill with `<!-- @skill-file <file>.md -->`, which sync renders as the installed file's path and fails on a name the skill does not ship.
- Files several skills share: `shared/<file>.md`, without frontmatter. Reach one from a skill or its supporting file with `<!-- @shared-file <file>.md -->`, which sync renders as the path of the copy it installs beside each skill referencing it, and only there. Sync fails on an unknown name, on a shared file named like a skill's own file, and on a `@skill-file` or `@shared-file` marker inside a shared file: name another shared file by its file name, and reference it from every skill referencing the first.
- `extension: <name>` in a fragment's frontmatter ships the fragment, with its supporting files, only while that extension is active.
- A `<!-- @extension <name> -->` or `<!-- @file <path> -->` marker opens a block of a fragment, closed by the next `<!-- @end -->`: sync keeps its text, without the markers, only while that extension is active or that project file exists. Wrap text that applies only under that extension or file; never nest these blocks.
- Keep every fragment project-agnostic: no paths, commands, tools or documents specific to one repository.
- After changing a fragment, run `pnpm engrenage sync agents`, which also updates this repository's own copies. It updates only installed skills: install a new skill first with `pnpm engrenage agents skills add <name>`.
