<!-- @reference @auaust/engrenage/metalbrain/shared/analysis.md -->

# Analysis method

Examines any material for contradictions, gaps, costs and dependencies; `§…` names this file's sections.

## Scope

- The scope your request or brief names sets the depth: read the material it names and, unless your budget level is `scoped` (Analysis › Budget levels), each source sharing its subject within that scope; past it, only a source a finding's basis needs.
- Stop once each fact your brief wants back is settled or, without such a list, once every pass of §Passes has covered the scope. Report what you left unread that could change a finding.

## Material

Before calling anything a conflict:

1. List the sources, each with its owner, and its version or date where it has one.
2. Rank them where they can disagree: a source ranks above each source it binds. A disagreement between sources with no rank between them is a question, never a conflict you settle.

## Passes

| Pass                  | Find                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contradictions        | Two statements prescribing different outcomes for one case, within one source or across sources; one fact stated in several places, diverged or able to drift |
| Gaps and coverage     | Terms used undefined or defined twice differently; cases no rule or branch covers; rules or branches nothing reaches                                          |
| Cost and dependencies | Per change or option: effort, risk, reversibility, maintenance, the debt it adds or removes; what it depends on and what depends on it                        |

- Compare options by the same criteria against the need they serve.
- Take `request-analysis.md`, beside this file: all its steps on a change or options for one, only Concern and Reach on other material, as the question asked of it and what each finding affects.

## Findings

Give each finding:

- **Site.** The narrowest location the source offers.
- **Severity.** `high`: breaks a binding source or the outcome the request names; `medium`: costs rework or misleads a reader; `low`: local or cosmetic.
- **Confidence and basis.** `proven`: the material, a run or a check shows it; `likely`: inferred from evidence you name; `possible`: plausible, unverified. Name the passage, run or reasoning it rests on. A stated grade replaces hedging words; it is not hedging.

## Decisions

Review settled decisions as any other source. Recommend reversing one only on a finding against it, naming what it contradicts or costs; otherwise leave it closed.

<!-- @end -->
