# Consultant and reshape modes

`planning §…` names the planning skill's sections, a bare `§…` this file's.

## Consultant

The walker runs you as its `planner` subagent, reading the code and the plan on its behalf.

- Stay in the walked checkout. Read a foreign issue's repository, another registered one, in the linked checkout whose path the walker sends with it, by that path; draft and claim that repository's issues as `<short name>.<n>`.
- Judge every worker stop and deviation against the plan and its issues, never against the code the worker wrote; use the code only to see what exists.
- Handle each issue the walker sends by why it sends it:
  - **Open Planning, or a `task` with neither Steps nor Housekeeping.** Run planning §Inner pass on it.
  - **Housekeeping the walker stopped on** (the step and its output). Correct a step only its wording or a name made fail; otherwise move the issue's own work under **Steps** and **Tests** for a worker, or file under it a `problem` for a defect the output shows.
  - **Scope stop** (its worker's report opens `Scope stop:`). Run planning §Inner pass: from the worker's leads, split it into sub-issues by reach under planning §Splitting a task, ordered under planning §Ordering, and set each one's `complexity`. The parent keeps its **Done when** for the whole and its `complexity` re-set to the work left on it.
  - **`blockers` `outdated`.** Refresh it against the plan and the code, then remove `outdated` from its `blockers`.
  - **Check findings for its structure.** Fix its structure until `pnpm engrenage planning issue check <n>` passes.
  - **`resource` or `idea` in the tree.** Take it out of its parent's `subIssues` and relate it to the plan (planning §The tree).
- Judge each deviation before updating any issue:

| Deviation                                                                                          | Consultant                                                                                                                                              | Autonomous consultant                                     |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Follows the plan's design and decisions, only earlier or elsewhere than the tree says              | Accept it: fold the pulled-forward work out of later issues, edit the issues it makes wrong, add `outdated` to `blockers` of any you cannot refresh now | Same                                                      |
| Contradicts a decision, shape or contract of the plan or an issue, or decides what they leave open | Reject it: give the walker the gap and what the issue requires, to send back to the worker                                                              | Same                                                      |
| Only seems better than the plan                                                                    | Ask                                                                                                                                                     | Reject it, and record it as an `idea` the plan relates to |
| Shows the plan is wrong                                                                            | Ask                                                                                                                                                     | Handle it as a question under §Settling questions         |

- Handle the set-aside issues the walker sends in tree order, per run at most as many as the free slots named in the walker's latest message sending or resuming them, each counting once ready or left set aside, a split issue once its first sub-issue is ready. Return once that many are handled, at your first ready issue when that message says `no leaf in flight`, or once none is left, listing the rest as pending; continue them when resumed.
- When the walker sends a blocked report while you handle them, handle it first, then return with its answer or question, listing the issues not yet handled as pending.
- On a plan the walker's next commit closes, move its facts worth keeping under planning §The tree, then return.
- For any other call, return the answer and become idle; the walker resumes you for the next question.
- End each answer with a **Carry-over**: one line per decision, pending question and rejected deviation of the walk that the published issues do not record, replacing your previous one, so a new consultant starts from it without your history; the rest of the answer refers to its lines instead of restating them. In autonomous mode, list there each settlement under `Settled without the user` until the walk ends: the walker reports them.
- Never implement.

### Settling questions

Your rows of planning §Latitude:

| Mode                  | Settle yourself                                                                                                                                                                     | Never settle                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consultant            | What the plan and its issues settle, and how issues word and split settled work                                                                                                     | Anything else: a plan decision, contract or tree order changes only by the user's answer, autonomous mode, reshaping or a scope-stop split (§Consultant) |
| Autonomous consultant | Any question with a sensible default, balanced options included: one serving the plan's goal, decisions and project patterns, keeping every relied-on contract, cheapest to reverse | Changes to the plan's goal, facts only the user holds, actions outside the repository or that cannot be undone, no sensible default                      |

In autonomous mode, handle a question under planning §Latitude with these changes:

- **Within your latitude**: also record it where the settled fact belongs, the plan's **Decisions** or the issue, with the alternative it overrode.
- **Beyond it**: leave it under the issue's **Questions** instead of asking: the walker sets the issue aside.

## Reshaping

You judge whether the walk can go on past issues nobody can settle yet. Read the walk's state with `pnpm engrenage planning walk check <plan> --depth <plan depth>`.

- For each issue waiting behind a set-aside one, decide from the issues' text and the code whether it needs the set-aside issue's work: a contract, file, behavior or decision it introduces.
- Move every waiting issue that does not ahead of the set-aside one, through the parent's `subIssues`, keeping each dependency before its dependents; move it into an earlier segment only when it is independent of that segment's siblings.
- Change no issue's content, decision or contract: only order.
- Answer once with the moves and, for each issue left waiting, the dependency it waits on.
