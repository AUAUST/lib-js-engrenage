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
- Derive behavior from authoritative sources, never from hardcoded lists, flags or example data. Fail clearly on missing invariants; fall back only where the contract says so.
- Write a comment only when it is technical or required: a constraint or reason the code cannot express, a directive a tool reads, or a `@debt` marker as the debt-markers rule describes. Never write a comment that describes what the code does; names carry that.
- Change repository-wide configuration only after trying an alternative inside the code you own. Report any configuration change with its reason separately from general code changes.
- Delete obsolete and commented-out code. Add no feature READMEs or `docs/` directory.
- When work would build on or deepen an architectural violation, fixing it comes first: stop under the decision protocol with what exists, the recommended fix and its scope. Correct violations you touch; report other nearby inconsistencies without fixing them.
- Write to GitHub only in repositories owned by the AUAUST organization.
- Keep secrets in `.env`, documented by `.env.example`, never in source, logs or runtime code.
- Propose missing or outdated skills, MCP servers, scripts, dependencies or abstractions when they would help; add, remove or upgrade them only with the user's approval.
