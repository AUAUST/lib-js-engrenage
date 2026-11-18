---
"@auaust/engrenage": patch
---

- Bound each consultant run by the walker's free slots, counting issues left set aside, and return at the first ready issue when no leaf is in flight
- Send a worker's blocker to a running consultant at once where the client allows it
- Cap resumes at two for repeated blockers, merger-reported conflicts and the boundary-review debugger, holding its work on a branch
- Request progress after 3 consecutive wait timeouts with no agent event
- Suffix a held branch name that already exists
