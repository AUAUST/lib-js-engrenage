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
- Log each solution you set aside under the discarded-solutions rule, and mark with `@debt` the code your change leaves short of the ideal.

### Dependencies

- Before building a capability, check whether a current dependency or an established library provides it.
- Weigh a dependency change like any other choice, by its size, the share you would use and its maturity.
- An experimental, single-maintainer or pre-1.0 library increases the cost of adoption but doesn't automatically rule it out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
