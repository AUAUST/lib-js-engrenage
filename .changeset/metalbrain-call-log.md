---
"@auaust/engrenage": patch
---

- Add the `metalbrain` binary, whose Claude Code PreToolUse and PostToolUse hooks log each tool call with its duration, output size and dollar cost to `.ai/stats/<session>/<agent>.calls.jsonl`
- Ship Claude model facts and prices as `@auaust/engrenage/metalbrain/models.json`
