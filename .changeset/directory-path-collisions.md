---
"@auaust/engrenage": minor
---

- Fail with `shared-structure-path` on a domain or sub-namespace path held in two directories of one namespace, naming both
- Fail with `nested-namespace-directory` on a namespace directory listed inside another of its directories with no other environment's placement between
- Stop the structure walk of a directory at another environment's placement, so a namespace directory re-entered below it is its own directory node
