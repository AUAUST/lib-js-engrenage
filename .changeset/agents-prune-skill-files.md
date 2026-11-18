---
"@auaust/engrenage": patch
---

- Sync deletes the generated skill directories, agent files and Codex profiles of skills engrenage no longer ships, and merges those of renamed skills into the skill replacing them, creating its agent; skills and agents without an engrenage reference stay untouched
- Flushing staged changes deletes the directories its removals leave empty
