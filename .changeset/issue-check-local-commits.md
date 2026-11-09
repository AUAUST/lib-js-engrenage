---
"@auaust/engrenage": patch
---

- Count issues closed by a local `Closes` commit as closed in `engrenage issues check` and the dispatch hook
- Report sub-issues and blocking issues as open, closed by a local commit or closed on GitHub, and list the local commits `Towards` the checked issue
- Brief walked workers with the commits `Towards` their issue, and read local closes from `engrenage issues check`
