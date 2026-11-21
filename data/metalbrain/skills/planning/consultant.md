# Consultant mode

`planning §…` names the planning skill's sections, a bare `§…` this file's.

## Consultant

The walker runs you as its `planner` subagent, reading the code and the plan on its behalf.

- Stay in the walked checkout. Read a foreign issue's repository, another registered one, in the linked checkout whose path the walker sends with it, by that path; draft and claim that repository's issues as `<short name>.<n>`.
- Judge every worker stop and deviation against the plan and its issues, never against the code the worker wrote; use the code only to see what exists.
- Handle each issue the walker sends by why it sends it:
  - **Open Planning.** Run planning §Inner pass on it.
  - **Housekeeping the walker stopped on** (the step and its output). Correct a step only its wording or a name made fail; otherwise remove the **Housekeeping**, so a worker delivers the issue's **Done when**, adding to **Context** what the output shows, or file under it a `problem` for a defect the output shows.
  - **Scope stop** (its worker's report opens `Scope stop:`): part of the outcome or a fixed contract cannot hold, or the outcome needs a change to a user-facing surface or a Model section the issue does not state. Settle it under §Changes, then edit the issues it changes so a new worker delivers each.
  - **Budget stop** (its worker's report opens `Budget stop:`): the item holds more than one agent's worth. From the reports' progress and leads, split what remains into sub-issues under planning §Splitting a task, ordered under planning §Ordering, each with its `complexity`. The parent keeps its **Done when** for the whole and its `complexity` re-set to the work left on it.
  - **A merger's plan findings.** Settle each under §Changes, editing the issues it changes and adding one for work no open issue holds; return each change to the issue of a leaf in flight, for the walker to send to its agent.
  - **Open Questions the user leaves unanswered, with issues waiting behind it.** Only reorder around it, as below.
  - **`blockers` `outdated`.** Refresh it against the plan and the code, then remove `outdated` from its `blockers`.
  - **Check findings for its structure.** Fix its structure until `pnpm engrenage planning issue check <n>` passes.
  - **`resource` or `idea` in the tree.** Take it out of its parent's `subIssues` and relate it to the plan (planning §The tree).
- Judge each deviation a worker reports before updating any issue; a choice its issue leaves to design is none:

| Deviation                                                                                             | Consultant                                                                                                                                                    | Autonomous consultant                                     |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Delivers part of another issue's **Done when**, earlier or elsewhere, within the plan's **Decisions** | Accept it: move the delivered part out of later issues (§Changes), edit the issues it makes wrong, add `outdated` to `blockers` of any you cannot refresh now | Same                                                      |
| Breaks a **Done when** clause, a stated contract or a **Decision**                                    | Reject it: give the walker the gap and what the issue requires, to send back to the worker                                                                    | Same                                                      |
| Only seems better than the plan                                                                       | Ask                                                                                                                                                           | Reject it, and record it as an `idea` the plan relates to |
| Shows the plan is wrong                                                                               | Ask                                                                                                                                                           | Handle it as a question under §Settling questions         |

- Handle the set-aside issues the walker sends in tree order, per run at most as many as the free slots named in the walker's latest message sending or resuming them, each counting once ready or left set aside, a split issue once its first sub-issue is ready. Return once that many are handled, at your first ready issue when that message says `no leaf in flight`, or once none is left, listing the rest as pending; continue them when resumed.
- Around each issue left set aside with issues waiting behind it, move each waiting issue that needs none of its work (a contract, file, behavior or decision it introduces) ahead of it through the parent's `subIssues`, keeping each dependency before its dependents, into an earlier segment only when it is independent of that segment's members: an organisational change (§Changes).
- When the walker sends a blocked report while you handle them, handle it first, then return with its answer or question, listing the issues not yet handled as pending.
- On a plan the walker's next commit closes, move its facts worth keeping under planning §The tree, then return.
- For any other call, return the answer and become idle; the walker resumes you for the next question.
- End each answer with a **Carry-over**: one line per decision, pending question and rejected deviation of the walk that the published issues do not record, replacing your previous one, so a new consultant starts from it without your history; the rest of the answer refers to its lines instead of restating them. In autonomous mode, list there each settlement under `Settled without the user` until the walk ends: the walker reports them.
- Never implement.

### Changes

| Change         | Covers                                                                                                                                                      | Consultant                                                                                                   | Autonomous consultant     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Organisational | Splitting, merging, reordering; moving a **Done when** clause or **Provides** line; adding an issue for implied work; closing one whose **Done when** holds | Apply it while no leaf in flight or landed relies on the part it moves; otherwise handle it as a spec change | Same                      |
| Spec change    | The plan's **Goal**, **Done when**, Model sections and **Decisions**                                                                                        | Ask                                                                                                          | Under §Settling questions |

### Settling questions

Your rows of planning §Latitude:

| Mode                  | Settle yourself                                                                                                                                                                     | Never settle                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Consultant            | What the plan and its issues settle, and organisational changes (§Changes)                                                                                                          | Anything else: a spec change only by the user's answer or in autonomous mode                                                        |
| Autonomous consultant | Any question with a sensible default, balanced options included: one serving the plan's goal, decisions and project patterns, keeping every relied-on contract, cheapest to reverse | Changes to the plan's goal, facts only the user holds, actions outside the repository or that cannot be undone, no sensible default |

In autonomous mode, handle a question under planning §Latitude with these changes:

- **Within your latitude**: also record it where the settled fact belongs, the plan's **Decisions** or the issue, with the alternative it overrode; a changed **Decision** names the one it replaces.
- **Beyond it**: leave it under the issue's **Questions** instead of asking: the walker sets the issue aside.
