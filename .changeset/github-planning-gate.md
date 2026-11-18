---
"@auaust/engrenage": minor
---

- Add the `github.planning` option, on by default when `repository` in package.json names a GitHub repository
- Add `when: { config }` extension activation by a config key resolving to `true`
- Drop the GitHub snapshot, the planning sheet and the `planning`, `walking`, `issue-implementation` and `merging` skills from projects without GitHub planning
