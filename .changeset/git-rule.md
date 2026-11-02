---
"@auaust/engrenage": patch
---

- Add a default `git` agent rule: no push by default, commit only to separate several tasks and otherwise suggest the message, `<type>: <summary>` subjects from a table of commit types whose summary is the label recalling the main change, a body of only one `Closes` or `Towards` line per issue, GitHub writes only in AUAUST repositories
- Drop the repeated "leave changes uncommitted" lines from the skills and the GitHub line from the implementation section, now carried by the `git` rule
