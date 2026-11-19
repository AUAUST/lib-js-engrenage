---
"@auaust/engrenage": patch
---

- Load issue drafting, walk and planning-sheet instructions only while GitHub planning is active
- Fall back to the backlog in the issues rule and the debugging, analysis and curation skills without GitHub planning
- Fall back to the instructions rule when no `writer` agent is installed
- Install the default rules of active extensions on sync
