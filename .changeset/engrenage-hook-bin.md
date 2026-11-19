---
"@auaust/engrenage": minor
---

- Run agent hooks through the new engrenage-hook bin, one settings entry per event
- Let agents work when a hook cannot load or run, with a message naming the fix
- Deprecate engrenage agents claude hook and engrenage agents codex hook: they run no check and ask to sync and restart the session
