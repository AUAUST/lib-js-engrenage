---
"@auaust/engrenage": minor
---

The commit gate rejects a commit subject longer than 72 characters, GitHub's cut-off, for every committer: `lefthook.yml` gains a `commit-msg` command running `engrenage gate --message {1} --everyone`, which `engrenage sync` adds to existing files.
