---
"@auaust/engrenage": patch
---

- Add the `analysis` AGENTS.md section, on by default: agents read each request as a hypothesis, work out its ideal solution, map it onto the codebase and adopt only the reach their role allows, and weigh dependencies by size, use and maturity instead of avoiding them
- Add the `discarded-solutions` rule, on by default: agents log each solution they set aside in `.ai/discarded.md`, so recurring ones surface as candidates
- Add the `analysis` skill and its `analyser` agent, analysing a request or part of the project in depth and reporting its ideal, reach and a recommendation
- Make planners pause on every costly reach of a request, however it is worded
