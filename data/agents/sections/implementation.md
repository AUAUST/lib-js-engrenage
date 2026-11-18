---
title: Implementation
description: Implement changes with clear ownership and boundaries.
category: workflow
default: true
order: 40
---

## Implementation

- Do the work a request asks of you yourself; dispatch an agent only when your skill directs it or the user asks for one.
- Quality takes precedence over completion: a workaround that adds architectural debt is not done. Judge quality by clear ownership, authoritative definitions, explicit contracts, predictable execution and state lifetime, readability and minimal necessary complexity, not by line or abstraction count.
- Write only these comments: tool directives, within each directive's rules; `@debt` markers; the JSDoc lint asks for, stating only the behavior its name and signature leave open; comments the user explicitly requests. Code that seems to need another comment is debt: mark what could be better, never explain the code.

| When                                                              | Do                                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Before editing                                                    | Inspect the execution path; place code with its owner, reusing or extending what it provides; several small pieces must not hide a missing abstraction |
| Work would build on or deepen an architectural violation          | Fix it first: stop under the decision protocol with what exists and the smallest coherent fix with its scope, never a temporary bypass                 |
| Your change rewrites code holding a violation                     | Correct it                                                                                                                                             |
| You notice a violation elsewhere                                  | Record it as a debt marker, discarded solution or backlog entry                                                                                        |
| Behavior depends on project data                                  | Derive it from the authoritative source, never from hardcoded lists, flags or example data                                                             |
| An invariant is missing                                           | Fail clearly; fall back only where the contract says so                                                                                                |
| Repository-wide configuration stands in the way                   | Try an alternative inside the code you own first; report a configuration change with its reason, apart from code changes                               |
| A generated or compiled file needs a change                       | Change its source and regenerate it                                                                                                                    |
| Code is obsolete or commented out                                 | Delete it                                                                                                                                              |
| Documentation seems needed                                        | No feature READMEs or `docs/` directory                                                                                                                |
| Running a tool                                                    | Bound its output to the relevant files and excerpts; keep verbose logs on disk; return the failing command, diagnostics and log path                   |
| Code needs a secret                                               | `.env`, documented by `.env.example`; never source, logs or runtime code                                                                               |
| A skill, MCP server, script or abstraction is missing or outdated | Propose it; add, remove or upgrade one only with the user's approval                                                                                   |
