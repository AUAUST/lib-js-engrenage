---
"@auaust/engrenage": minor
---

- `engrenage github fetch` writes `.engrenage/github.json`: labels of every registered repository and issue types, fields and pinned fields of their organizations, with GitHub's ids; it fails first on a token missing the `repo` or `read:org` scope
