---
"@auaust/engrenage": patch
---

- Add `merge <new-id> <kept-id> [--note <text>]` to the backlog, friction, discarded and missing commands
- List up to three similar entries of its kind, each with its merge command, after `add` prints a new entry's ID, asking to merge into the one recording the same thing
- Warn in the agents' commit-msg gate about up to three backlog entries related to the message, a staged `@debt` statement or a staged file
- Add the optional `title` field to `RecordKind`, naming the field a merge's default note reads
