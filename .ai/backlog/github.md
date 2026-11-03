# github

GitHub repository synchronization: labels, issue fields and issue templates.

## 1. Synced labels lack specific categories, priority fields and a plan/block/task hierarchy.

- why: the synced labels use `Bug: High | Medium | Low`.
- want:
  - More specific label categories.
  - `Type: Bug` plus the custom `Priority` field (`High | Medium | Low`) instead of priority-in-label.
  - Labels for the issue levels: Plan (parent/root), Block (group of tasks) and Task (individual actionable item).
  - Better issue dependencies: a bug is never part of a plan directly (bugs are logged for fix and stay at the root), but can be a blocking dependency of tasks.
  - Managed labels and fields, relying on GitHub's native issue fields as far as possible instead of labelling everything: Environment (mapping to the environments defined in engrenage: source, tests, tooling, bin, scripts, data); general nature (bug, feature, task, improvement); priority or urgency (low, medium, high, critical); status or state (blocked by other, missing info).
  - To settle: how these overlap with the Type, Priority and Plan/Block/Task levels above (for example the priority scale, Low | Medium | High versus up to critical).
- done: sync produces these labels and fields and the dependency rules are stated in the shared instructions.

## 2. No issue templates exist for plan, block and task issues.

- why: depends on `github.1`.
- want: templates that open plan, block and task issues with the relevant fields filled and the parent or blocking issues linked, if GitHub's template features allow it.
- done: each issue level has a template, or the limits of GitHub templates are recorded.

## 3. Label synchronization should be its own subcommand, not part of `sync`.

- why: depends on `github.1`.
- want: `engrenage github labels`, like agents have their own dedicated commands, diffing the proposed labels against the labels existing on GitHub and showing three lists: matches, missing labels (pick which to add, all by default) and extra labels (pick which to remove, none by default). The same applies to bug severities and any other field defined later.
- done: labels, and the fields defined with them, are synced by the dedicated subcommand and no longer by the main `sync`.
