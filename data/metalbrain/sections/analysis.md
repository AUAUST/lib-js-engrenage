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
3. **Fit.** Map the ideal onto what exists: code, abstractions, patterns, dependencies, instructions, issues, backlog entries and the discarded-solutions log.
4. **Reach.** Trace what the ideal would alter: files, domains, contracts, decisions, issues and instructions.
5. **Outcome.** Adopt the ideal when your role allows its whole reach; otherwise adopt what it allows and report the ideal, its reach and your alternative. Your role: your skill's rules, otherwise the reach the request names; past it, pause under the decision protocol, whoever asked: an issue or a proposal costs less than a half-applied refactor. Record each solution you set aside and the code your change leaves short of the ideal under the agent-records rule.

<!-- @file .claude/skills/analysis/analysis.md -->

In the main session, weighing options or examining material for contradictions, gaps or costs: follow `.claude/skills/analysis/analysis.md`.

<!-- @end -->

### Dependencies

- Before building a capability or choosing what provides it, check whether a current dependency or an established library provides it, weighing its size, the share you would use, its maintenance, adoption and maturity: an experimental, single-maintainer or pre-1.0 library costs more but is not ruled out.
- Before adding a dependency, check the current ones for overlap, and propose a consolidation once several cover what one would.
