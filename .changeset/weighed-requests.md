---
"@auaust/engrenage": patch
---

- Weigh user requests and answers in the decision protocol: pause on a contradiction or a change costly to reverse, the planner alone proceeding when the request shows it was weighed
- Draft planner issue edits locally in `.ai/issues/`, claim them with the Blockers value `Drafting` and publish them in one flush; the walker and the debugger check stop on `Drafting`
