# Agent friction

- `gh api issue-field-values`: clear the `Drafting` blocker by posting an empty multi-select array — 422 "must contain at least one option"; `DELETE repos/{owner}/{repo}/issues/<n>/issue-field-values/<field id>` works, undocumented in the drafts flush mechanics
- `gh issue view --repo`: read issues from `AUAUST/engrenage` — repository is `AUAUST/lib-js-engrenage`; had to read the git remote
