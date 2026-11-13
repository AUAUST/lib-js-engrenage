---
"@auaust/engrenage": patch
---

Claude sessions and subagents record their runs (turns, tools, tokens, context, stops) under the gitignored `.ai/stats` on each stop, and `engrenage agents stats` reports a session's runs by role and agent in weighted units.
