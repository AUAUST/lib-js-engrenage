---
"@auaust/engrenage": patch
---

- Load the `changesets` rule in every session, so its rules apply before an agent creates a changeset
- Let a worker or debugger dispatched without a walker commit its settled work, signalled by a `Walk:` brief line
- Cap a walker's resumes of a leaf's agent at two per gate failure, gap or finding in every mode
- Narrow the `analysis` skill's trigger to analysing, assessing, rethinking or reviewing a concern, design or part of the project
