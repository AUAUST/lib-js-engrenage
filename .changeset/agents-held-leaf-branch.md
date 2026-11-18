---
"@auaust/engrenage": patch
---

- Move a leaf the walker sets aside to its own `worker/issue-<n>` or `debugger/issue-<n>` branch, so the walk goes on from a clean tree
- Let the walker dispatch consultant-ready issues as they appear and count each inner planner resume against the planning pool
- Let inner, consultant and reshape planners publish without reporting each diff first
