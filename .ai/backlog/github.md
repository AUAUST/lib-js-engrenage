# github

GitHub repository synchronization: labels, issue fields and issue templates.

## 1. Synced labels lack specific categories, priority fields and a plan/block/task hierarchy.

- Matter: the synced labels use `Bug: High | Medium | Low`.
- Expected:
  - More specific label categories.
  - `Type: Bug` plus the custom `Priority` field (`High | Medium | Low`) instead of priority-in-label.
  - Labels for the issue levels: Plan (parent/root), Block (group of tasks) and Task (individual actionable item).
  - Better issue dependencies: a bug is never part of a plan directly (bugs are logged for fix and stay at the root), but can be a blocking dependency of tasks.
- Done when sync produces these labels and fields and the dependency rules are stated in the shared instructions.

## 2. No issue templates for plan, block and task issues.

- Expected: templates that open plan, block and task issues with the relevant fields filled and the parent or blocking issues linked, if GitHub's template features allow it.
- Depends on: `github.1`.
- Done when each issue level has a template, or the limits of GitHub templates are recorded.
