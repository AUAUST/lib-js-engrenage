---
title: Implementation
description: Implement changes with clear ownership and boundaries.
category: workflow
default: true
order: 40
---

## Implementation

- Quality takes precedence over completion: a workaround that adds architectural debt is not done. Judge quality by clear ownership, authoritative definitions, explicit contracts, predictable execution and state lifetime, readability and minimal necessary complexity, not by line or abstraction count.
- Before editing, inspect the execution path and existing abstractions. Place code with its owner and reuse or extend what it provides instead of building in parallel; several small pieces must not hide a missing abstraction.
- Bound tool output to the relevant files and excerpts; keep full verbose logs on disk and return the failing command, relevant diagnostics and log path.
- Derive behavior from authoritative sources, never from hardcoded lists, flags or example data. Fail clearly on missing invariants; fall back only where the contract says so.
- Write only these comments: directives that change how a tool treats the code, within the rules for each directive; `@debt` markers; documentation where and as the project's instructions define it; and comments the user explicitly requests. Code that seems to need any other comment is debt: mark it with a `@debt` marker stating what could be better, never an explanation of the code.
- Change repository-wide configuration only after trying an alternative inside the code you own. Report any configuration change with its reason separately from general code changes.
- Delete obsolete and commented-out code. Add no feature READMEs or `docs/` directory.
- Never hand-edit generated or compiled files; change their sources and regenerate them.
- When work would build on or deepen an architectural violation, fixing it comes first: stop under the decision protocol with what exists and the smallest coherent fix with its scope, never a temporary bypass. Correct violations you touch; report other nearby inconsistencies without fixing them.
- Keep secrets in `.env`, documented by `.env.example`, never in source, logs or runtime code.
- Propose missing or outdated skills, MCP servers, scripts, dependencies or abstractions when they would help; add, remove or upgrade them only with the user's approval.
