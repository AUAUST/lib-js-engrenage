<!-- @reference @auaust/engrenage/metalbrain/skills/planning/main-session.md -->

# Single and outer modes

## Requests

Handle each request of the user by its kind:

| Request                                                                                       | Handling                                                                                                                                                    |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code change ("add X", "make Y do Z", "fix W")                                                 | Write it into the issue owning it. Implement only when the user explicitly asks you to leave planning for that piece of work                                |
| Agent instructions or project context for the current structure                               | Apply now, under the project's instruction-maintenance rules, so workers start with the correct context                                                     |
| Instructions for a change not yet made ("once this is restructured, update the instructions") | Write into the **Steps** of the task making that change each rule's intent, constraints and target file, with proposed wording only for a one-sentence rule |

## Outer pass

Lay the groundwork in breadth: the plan, the tree, and each item's context, valid enough for a planner to deepen the item alone.

1. **Goal.** State the concern behind the request, the target outcome resolving it and what done means for the whole plan. Create the plan issue as soon as the goal is clear.
2. **Load.** Load the open-issue index as `.claude/rules/issue-drafts.md` › Filing states: the issues in a temporary file, only an index in context. Read the backlog categories, `@debt` markers and discarded solutions covering what the goal touches.
3. **Implications.** Find everything the goal touches (domains, entry points, models, conventions, contracts, call sites, issues, backlog entries, debt markers) and how the plan relates to each: extends, supersedes, conflicts with or depends on it.
4. **Design.** Write into the plan the model and **Decisions** several items share. A fact two items would each decide belongs here.
5. **Items.** Create, split, order and link each item as soon as its need is settled. Give it its header, its **Context** with the reach **Implications** found, its **Prerequisites**, and under **Planning** the design its inner pass must settle.
6. **Reconcile.** Extend an overlapping issue instead of creating one, mark duplicates, relate the issues the plan supersedes, and track the backlog entries it takes up.

Every path, name and reference the issues state matches reality or is an explicit decision to change it.

## Inner dispatch

Outer mode, once the groundwork holds:

- the plan has no **Planning** or **Questions**, and the user confirmed its goal, **Decisions** and tree;
- every item states its **Context** and, under **Planning**, what is left to design;
- every fact more than one item would decide is in the plan;
- every draft is published.

1. Keep up to K inner planners in flight, K from `pool <K>` in the user's request, 2 when unset, dispatching the next item as each reports. Dispatch a new `planner` per item, in the background and in the main checkout, briefed `inner` with `Issue: <owner>/<repo>#<n>` as the first line and the plan number. A segment whose members share their design is one item; group no other items: every turn re-reads a planner's whole context, so its cost grows faster than its items.
2. Batch the inner planners' questions to the user, apply their plan findings yourself, and resume every inner planner whose item an answer or a plan change affects, already deepened or not, each resume taking a slot of the K.
3. Once every inner planner has reported, review the tree under §Readiness.

<!-- @end -->
