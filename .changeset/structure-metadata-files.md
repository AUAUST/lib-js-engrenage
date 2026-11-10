---
"@auaust/engrenage": minor
---

- Read `.namespace.json` and `.domain.json` beside structure directories as namespace and domain declarations, merged with the config's `structure`; nodes they alone declare resolve with source `metadata`
- Let a domain's own declaration override only the fields it sets of a matching domain glob
