---
title: Shell
description: Avoid the traps of the shell agents run commands in.
category: workflow
default: true
order: 36
---

## Shell

- Quote every glob passed as an argument: zsh aborts on an unmatched glob.
- Pass lists as arrays or through `xargs`: zsh never splits an unquoted variable.
- Never start a word with `=`: zsh expands it as a command path.
- On macOS, rely on each tool's own timeout, since there is no `timeout`, and write `sed -i ''`, since BSD `sed` requires the suffix.
- In an agent worktree, run each git command alone and write files with the edit tools: Claude Code refuses compound commands, heredocs and command text naming git there.
