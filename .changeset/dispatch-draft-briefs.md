---
"@auaust/engrenage": patch
---

- Check a worker or debugger brief whose first line is `Draft: <absolute path>` against that local draft in the dispatching checkout's `.ai/issues/`, as `planning issue check` checks drafts, and deny it listing the findings
- Allow a worker brief naming neither an issue nor a draft
- Deny a worker or debugger brief whose `Issue:` or `Draft:` line is not its first line
