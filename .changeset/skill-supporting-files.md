---
"@auaust/engrenage": patch
---

- Sync a skill's supporting files, shipped in a directory named after it, beside its `SKILL.md` for each preferred runtime, and remove those whose source is gone
- Report missing, drifted or stale supporting files in `agents check`
- Fail sync on supporting files of a skill declaring an agent
- Fill `@reference` blocks in every Markdown file of skill directories by default
- Move the cross-repository walk protocol into `walking/cross-repository.md`, read only when a walk meets a foreign leaf or a linked defect
