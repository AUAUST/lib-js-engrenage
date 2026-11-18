---
title: Analysis
description: Find the concern behind a request and its ideal solution before choosing what to adopt.
category: workflow
default: true
order: 25
---

## Analysis

Analyse every request, suggestion and described fix before acting on it, within the research your role allows:

1. **Concern.** Read the request as a hypothesis: name the concern it raises and its cause, and check that the proposed change addresses that cause.
2. **Ideal.** Work out the soundest solution to the cause as if time, scope and budget had no limit.
3. **Fit.** Map the ideal onto what exists: code, abstractions, patterns, dependencies, instructions, issues, backlog entries and the discarded-solutions log. Adopt it when the codebase already supports it.
4. **Reach.** Otherwise trace what the ideal would alter: files, domains, contracts, decisions, issues and instructions.
5. **Outcome.** Adopt the ideal when your role allows its whole reach. Otherwise adopt what your role allows, and report the ideal, its reach and the alternative you chose.

- Your role sets what you may adopt: your skill's rules, otherwise the reach the request names, pausing under the decision protocol before anything past it.
- Never adopt a reach your role does not allow, whoever asked: an issue or a proposal costs less than a half-applied refactor.
- Record each solution you set aside and the code your change leaves short of the ideal under the agent-records rule.

### Dependencies

- Before building a capability, check whether a current dependency or an established library provides it, weighing its size, the share you would use and its maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
