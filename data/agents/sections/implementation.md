---
title: Implementation
description: Implement changes with clear ownership and boundaries.
category: workflow
default: true
order: 40
---

## Implementation

- Quality takes precedence over feature completion. A functional workaround that introduces architectural debt is not a completed feature.
- Before editing, inspect the execution path, authoritative definitions and available abstractions. Place code with its established owner and reuse its models, utilities, configuration and contracts rather than building parallel implementations.
- Judge quality by clear ownership, authoritative definitions, explicit contracts, predictable execution and state lifetime, readability and minimal necessary complexity. Neither fewer lines nor more abstractions is inherently better.
- Extend established extension points autonomously. Several small utilities or files must not disguise a missing abstraction.
- Derive behavior from authoritative configuration, definitions, metadata or live data. Do not invent hardcoded catalogues, lists, status flags or example data.
- Fail clearly on missing invariants. Use fallbacks only when they belong to the intended contract.
- Avoid code comments; prefer a named function or descriptive variable. Comment only essential intent or constraints.
- Delete obsolete starter code and commented-out implementations. Do not add READMEs for features or a `docs/` directory.
- When work would build on or deepen an architectural violation, correcting it is a prerequisite: stop under the decision protocol with what is required, what exists, the recommended fix and its scope. Correct existing violations you touch.
- Report relevant nearby inconsistencies without fixing them. Do not do unsolicited cleanup.
- `.claude/backlog.md` holds deferred work: architectural debt, upstream bugs and failing checks left unfixed. Add an entry when you report such an issue or the user defers work, under the matching numbered category. Point `N.M` is entry `M` of category `N`; remove resolved entries and renumber the rest.
- Keep secrets in `.env` (documented by `.env.example`), out of source, logs and runtime code.
- Propose missing or outdated skills, MCP servers, scripts, dependencies or abstractions when they would help. Never add, remove or upgrade them without the user's approval.
