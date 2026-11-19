<!-- @reference @auaust/engrenage/metalbrain/skills/shape/drafting.md -->

# Drafting

Read `.claude/rules/issues.md` and `.claude/rules/issue-drafts.md` before your first draft.

1. Create the issue draft as soon as a request's scope is clear, and update it each time the discussion settles a point, so the user follows the direction in the draft as it forms.
2. Once the draft is settled and its scope fits a few issues, offer the user in one message the choice between publishing it then dispatching, and dispatching straight from the draft. Publish only on that choice: it replaces the issue-drafts rule's default publishing.
3. Brief the worker with `Issue: <owner>/<repo>#<n>` as the first line for a published issue, `Draft: <absolute path>` for a draft.
4. Commit a published issue's work with `Closes #<n>`. Delete a draft never published once its work's review and commit are done; the worker never deletes it.

<!-- @end -->
