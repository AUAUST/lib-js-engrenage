---
"@auaust/engrenage": minor
---

- Rename the `toolsAgents` built-in extension to `toolsMetalbrain`, now named `tools/metalbrain`, and add `toolsMetalbrainClaude`; `toolsAgentsClaude` only registers the Claude runtime
- Remove the `@auaust/engrenage/agents`, `agents/constants`, `agents/claude` and `agents/claude/constants` entries
- Add `@auaust/engrenage/metalbrain`, `metalbrain/constants`, `metalbrain/claude` and `metalbrain/claude/constants` for engrenage's metalbrain glue
- Add `@auaust/engrenage/future/metalbrain/{backlog,instructions,records,runtimes}` and their `/constants` subpaths for the code bound for `@auaust/metalbrain`
