<!-- @reference @auaust/engrenage/metalbrain/skills/shape/drafting.md -->

# Drafting

Read `.claude/rules/issues.md` and `.claude/rules/issue-drafts.md` before your first draft.

1. Create the issue draft as soon as a request's scope is clear, and update it each time the discussion settles a point, so the user follows the direction in the draft as it forms.
2. Once the draft is settled, check it against the issue-drafts rule › Size. When it holds more than one agent's worth, split it there into sub-issue drafts, or, when a part's design is unsettled, follow the shape skill's §Growing scope instead. Then offer the user in one message the choice between publishing it then dispatching, and dispatching straight from the draft. Publish only on that choice: it replaces the issue-drafts rule's default publishing.
3. Dispatch only issues of one agent's worth: a split issue's sub-issues one at a time in order, then the issue itself for its remaining **Steps**. Brief the worker with `Issue: <owner>/<repo>#<n>` as the first line for a published issue, `Draft: <absolute path>` for a draft.
4. Commit a published issue's work with `Closes #<n>`. Delete a draft never published once its work's review and commit are done; the worker never deletes it.

An issue holding **Housekeeping** is dispatched through its open sub-issues only, never itself. Once their work is committed, apply it yourself, a change the last row of the shape skill's §Agents lets you make, by this file:

`.claude/skills/shape/housekeeping.md`

- Its commits: under the git rules through the commit gate, the last one closing the issue as step 4 states; the gate refusing one stops you as a failing step does.
- Handing it back: tell the user the step and output that stopped you, and handle the fix it calls for as any finding.

<!-- @end -->
