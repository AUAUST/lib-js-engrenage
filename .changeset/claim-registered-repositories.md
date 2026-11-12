---
"@auaust/engrenage": patch
---

- Claim a registered repository's issue as `<repo>.<n>` with `planning issue claim`, without the `drafting` lock, and write every reference in its draft as `#{<repo>.<n>}`
- Fail `planning issue check` on a bare `#<n>` in a draft of another repository
- Report issues of other repositories that a publish set re-parents without claiming them
