---
"@auaust/engrenage": patch
---

- Add `--checkout <repository>=<directory>[@<ref>]` to `planning walk check` and `planning issue check`, counting that checkout's unpushed `Closes` and `Towards` commits for its repository's issues
- Count the current directory's commits for its own repository's issues, whichever repository is walked
- List each checkout read, and its ref, at the top of `planning walk check`
