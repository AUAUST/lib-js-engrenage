---
"@auaust/engrenage": patch
---

- Have workers commit each validated checkpoint in every checkout, and callers review and drop their work from the dispatch base without resetting unheld commits
- Default walks to one leaf in flight, and count shape's writers in the implementers' pool
- Keep instruction changes to the `writer` agent or a consenting main session: other dispatched agents report them instead
