---
title: Shell
description: Avoid the traps of the shell agents run commands in.
category: workflow
default: true
order: 36
---

## Shell

| Trap                                                                                                              | Write                                                |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| The shell expands an unquoted glob, and zsh can abort when it matches nothing                                     | Quote every glob passed as an argument               |
| zsh never splits an unquoted variable                                                                             | Lists as arrays or through `xargs`                   |
| zsh expands a word starting with `=` as a command path                                                            | No word starting with `=`                            |
| macOS has no `timeout`                                                                                            | Each tool's own timeout                              |
| BSD `sed` requires the in-place suffix                                                                            | `sed -i ''`                                          |
| In a session started with worktree isolation, Claude Code refuses compound commands, heredocs and text naming git | Each git command alone; files through the edit tools |
