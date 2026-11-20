---
"@auaust/engrenage": patch
---

- Batch agent records into the next commit, committing them alone only at a flush: many backlog entries, a handoff or stop record, a closing segment or walk, or the end of a session
- Keep pending records uncommitted around the cherry-picks, resets and discards of agent work, instead of committing them first
