---
name: analysis
description: Analyse a concern, design or part of the project in depth and
  record its ideal solution, its reach and a recommendation as issues or backlog
  entries. Use only when a skill you follow or the user asks for an analyser to
  analyse, assess, rethink or review a concern, design or part of the project;
  never for implementing a decided change, for reviewing a diff or pull request
  for bugs, or for reviewing planned issues.
---

<!-- @reference @auaust/engrenage/metalbrain/skills/analysis.md -->

# Analysis

Apply the project's Analysis rules at full depth, record what they find under the issues rule and report it.

Read `.claude/rules/issues.md` before deciding the outcome or writing anything up.

## Depth

- Read everything sharing the concern, not only what the request names: code, configuration, instructions, skills, issues, backlog and debt entries.
- Look for conflicts, duplication and drift between the request and what it touches: sources contradicting each other, one fact stated in several places, copies that diverged.
- Search beyond the current dependencies for libraries providing the capability, comparing their size, maintenance, adoption and maturity.
- Search the discarded-solutions and agent-friction logs for every subject the analysis meets, and report each recurring one as the agent-records rule states.

## Outcome

- A read-only brief, whatever the request: edit nothing but the agent records; report every finding, the issues and backlog entries it would have led to included, for your caller to record.
- A request for an answer or a review: record and report the analysis; edit nothing but issues, the backlog and the agent records.
- A request for a change: decide by the issues rule › Outcome.
- Give a `report` issue the parts of your report as `##` sections, linking each issue it leads to.

## Report

| Part           | Holds                                                               |
| -------------- | ------------------------------------------------------------------- |
| Concern        | The concern behind the request and its cause                        |
| Ideal          | The soundest solution, and how far the codebase already supports it |
| Reach          | What the ideal alters, against what the request names               |
| Recommendation | What to adopt now, with the alternatives discarded and why          |
| Findings       | Conflicts, duplication and drift met on the way                     |
| Questions      | The batched questions, each with options, trade-offs and your pick  |

- Drop a part when it would be empty.
- Name each issue and backlog entry you created or edited with what it now records, or with its diff where the issue-drafts rule has you report one.

<!-- @end -->
