---
"@auaust/engrenage": minor
---

Planning drafts reference and create issues in registered repositories: `#{<repo>.<n>}` and `#{<repo>.new-<slug>}` resolve through the registry, `planning issue create --repo <repo>` drafts an issue there, `check` checks issues of registered repositories, and `publish` renders every reference relative to the issue's repository. `claim` refuses issues of other repositories.
