# Issue tree

Shaping a tree of planned issues: its issue types, splitting, ordering, deepening an item and readiness. `§…` names this file's sections.

## The tree

| Issue     | What it is                                                             | Its sub-issues                                                                                  |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `plan`    | A standalone tree's root: goal, design and decisions                   | Its sequence                                                                                    |
| `segment` | A wrapper with no work of its own, grouping items that share a context | Its members, in any order, never another segment                                                |
| `task`    | Item: positive work, one feature taken from nothing to finished        | When split, a sequence of its inner parts, at any depth; segments group unrelated prerequisites |
| `problem` | Item: negative work, something wrong to fix                            | When split, a sequence of its inner parts, at any depth; segments group unrelated prerequisites |

A sequence: the ordered sub-issues of a plan or item, each an item, a segment or a nested plan. An issue with open sub-issues is worked through them: its open sub-issues first, then its own work, then it closes.

Proposals are `idea` issues the plan relates to, never sub-issues. Before a plan or item closes, move the facts worth keeping to their owner, a `specification` or an `archive` the plan relates to.

## Splitting a task

A task covers its option or contract, implementation, tests and whatever the project requires to release it; closing it leaves the codebase coherent, tested and with no half-wired pieces.

Split a task holding more than one agent's worth (issue-drafts rule › Size), and extract from a task any new architecture, new design pattern or refactor across several domains it needs. Place each extracted part by what it is:

| Extracted part                                                                                            | Becomes                                                    |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Stands on its own: a new pattern, architecture other work builds on, a change meaningful beyond this task | Its own task earlier in the tree, listed as a prerequisite |
| Only meaningful as a part of this task's result                                                           | A sub-issue, split and grouped by the same rules           |
| Cannot be verified without another candidate task                                                         | Merged with it                                             |

- Design the final shape before migrating to it, so each call site moves once.
- Split one level at a time: a sub-issue still over one agent's worth keeps its split under **Planning** until the walk reaches it.

## Ordering

Order expresses urgency, not importance: a task comes first because later work stands on it. The walker runs a segment's members at once and a sequence's members one at a time, so place an item after another only for a dependency you can name.

| Situation                                                                               | Placement                                                                                                                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| B depends on A                                                                          | B after all of its dependencies                                                                                                        |
| B needs from A only a piece A does not use itself: a helper, a type, an option          | The piece moved into B, both in one segment                                                                                            |
| Later work depends on a task and nothing can run alongside it                           | Alone in the sequence; never a single-item segment                                                                                     |
| Two or more tasks can be done at the same point                                         | One segment. Touching the same files is fine; needing each other's output is not.                                                      |
| A segment member needs another member's result                                          | Its piece moved as above when it can be; otherwise moved after the segment, or merged with it if they are one feature                  |
| Work that is only housekeeping (issue-drafts rule › Bodies) needs other work done first | That other work as sub-issues of an issue holding it under **Housekeeping**, applied after them without a dispatch; never its own item |
| Adjacent segments, the later one independent of the earlier                             | Merged, to keep the sequence short                                                                                                     |

- Move a piece between tasks only when each stays one coherent feature, verifiable without the other.
- Never add or split an item only to run work concurrently: each item adds a dispatch, a merge and a review.

## Deepening an item

Deepen an item until it is ready for its agent (§Readiness).

1. **Read** the item, its ancestors, the plan sections its header names, its prerequisites and its siblings' gists.
2. **Ground** in code only what the item states, the rest left to its worker: each path, name and shape in its **Context**, and each contract it fixes or relies on, against the code providing it.
3. **Write** **Done when**, the **Tests** cases it needs and its **Provides** (issue-drafts rule › Bodies); for a `problem`, **Fix** or **Leads**; for an item whose own work after its sub-issues is only housekeeping, **Housekeeping**; splitting the item under §Splitting a task with sub-issues under it only. Remove **Planning** once settled; keep under it design resting on code another open item writes beyond Model-section contracts, which that code's landing would rewrite.
4. **Review** the item and each sub-issue you wrote under §Readiness.

## Readiness

An issue is ready for a worker when `pnpm engrenage planning issue check <n>` passes, it holds one agent's worth (issue-drafts rule › Size) and, read with its ancestors as a worker reads it:

- its **Done when** states an observable end state serving the plan's **Done when** within its **Goal** and **Decisions**;
- each contract other items or users rely on is stated, in a Model section or the item's **Provides**;
- it fixes no procedure: placement, helpers, reuse and internal shapes stay the worker's;
- its **Context** states only verified facts.

Move whatever falls short under **Planning** or **Questions**, never leave it implied.

A `problem` without **Fix** is ready for a debugger once `check` passes, it holds one agent's worth and its **Leads** state only what you verified, suspected sites marked as such.

An item holding **Housekeeping** is ready once `check` passes and each step is housekeeping as the issue-drafts rule › Bodies defines it, the commands, files and entries it names verified to exist.
