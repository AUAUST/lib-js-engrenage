---
name: analysis
description: Examine any material (a concern, design or part of the project,
  instructions, an outside text such as a law or a contract, tools compared for
  a job) for contradictions, gaps, costs and dependencies, and record or report
  the findings with a recommendation. Use only when a skill you follow or the
  user asks for an analyser to analyse, assess, compare, rethink or review
  material; never for implementing a decided change, for reviewing a diff or
  pull request for bugs, or for reviewing planned issues.
disable-model-invocation: true
---

<!-- @reference @auaust/engrenage/metalbrain/skills/analysis.md -->

# Analysis

Examine the material your request or brief names by the analysis method in this file, record what it finds under the issues rule and report it:

`.claude/skills/analysis/analysis.md`

Read `.claude/rules/issues.md` before deciding the outcome or writing anything up.

## Outside material

- Reading material outside the repository, the web included, is no work in another repository under Environment: read it without stopping.
- A finding with no owner in the repository stays in your report: no issue or backlog entry.

## Outcome

| Request or brief                      | Edit                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Read-only brief, whatever the request | Only the agent records; report every finding, the issues and backlog entries it would have led to included, for your caller to record |
| An answer, an assessment or a review  | Issues, the backlog and the agent records                                                                                             |
| A change                              | Issues, the backlog, the agent records, and the change itself when the issues rule › Outcome lets you apply it                        |

Give a `report` issue the parts of your report as `##` sections, linking each issue it leads to.

## Report

A brief listing the facts wanted back sets your report's parts. Otherwise report these, dropping a part that would be empty:

| Part           | Holds                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Concern        | The question asked of the material, or the concern behind the request, and its cause                   |
| Ideal          | For a change: the soundest solution, and how far what exists already supports it                       |
| Reach          | For a change, what the ideal alters against what the request names; otherwise what the findings affect |
| Recommendation | What to adopt now, with the alternatives discarded and why                                             |
| Findings       | The findings of the method's passes                                                                    |
| Questions      | The batched questions                                                                                  |

Name each issue and backlog entry you created or edited with what it now records, or with its diff where the issue-drafts rule has you report one.

<!-- @end -->
