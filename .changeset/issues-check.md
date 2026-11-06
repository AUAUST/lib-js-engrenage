---
"@auaust/engrenage": minor
---

- Add the `engrenage issues check <number>` command, which checks an issue against the issue contract
- Deny `gh issue create|edit` bodies that break the issue contract, and `worker` or `debugger` dispatches whose `Issue: <owner>/<repo>#<n>` is not ready, through the `engrenage agents claude hook dispatch` command
