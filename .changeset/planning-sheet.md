---
"@auaust/engrenage": minor
---

- `github.protocol` maps each meaning of the issue protocol (types, fields, options, close reasons) to its GitHub name; issue checks and the walk check read names through it
- `engrenage sync agents` generates `.claude/rules/planning-sheet.md` from `.engrenage/github.json`: registered repositories, their labels, and every type, field and option with its meaning and description; it fails on a mapped name the snapshot lacks, and without a snapshot it warns and describes each meaning's intent
- Shared skills name protocol meanings instead of GitHub names
