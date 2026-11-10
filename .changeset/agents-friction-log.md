---
"@auaust/engrenage": patch
---

- Add the `agent-friction` rule, on by default: agents log in `.ai/friction.md` each retry, workaround or lookup their tools and workflow cost them, so recurring stumbles surface as fix candidates
- Make the analyser read the agent-friction log alongside the discarded-solutions log
