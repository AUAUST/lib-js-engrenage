# Review

Reviewing a diff an agent returns against its specification: its issue or draft, otherwise its brief. Your skill sets what you read and where each finding goes.

| Criterion   | A finding when                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Done when   | A clause of the specification's **Done when**, or the outcome its brief states, does not hold once the diff applies    |
| Contracts   | The code departs from a contract the issue's **Provides** or a Model section of a plan above it states                 |
| Tests       | A **Tests** case is missing or expects another outcome than it states                                                  |
| Siblings    | The diff duplicates a helper, test or fixture of work landed beside it, or handles a concern they share in another way |
| Reuse       | The diff adds what the code it touches or a current dependency already provides                                        |
| Correctness | The changed code holds a bug                                                                                           |
| Release     | The changeset the Environment table requires is missing                                                                |

- Judge placement, helpers, internal names and shapes only by these criteria and the project's rules: the specification leaves them to its agent.
- List every finding, whatever its severity, before sorting any. Then sort each one: a plan finding when only a change to an issue or the plan resolves it, as a **Done when** clause, stated contract or **Tests** case that is wrong, conflicts with another issue's or misses what the plan's **Done when** needs; otherwise a leaf finding. Route both by your skill.
