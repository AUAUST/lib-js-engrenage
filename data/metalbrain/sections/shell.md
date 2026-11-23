---
title: Shell
description: Avoid the traps of the shell agents run commands in.
---

## Shell

Write commands in POSIX sh, which zsh runs with these traps:

| Trap                                                                                                              | Write                                                |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| zsh aborts on an unquoted glob matching nothing                                                                   | Quote every glob passed as an argument               |
| zsh never splits an unquoted variable                                                                             | Lists as arrays or through `xargs`                   |
| BSD `sed` requires the in-place suffix                                                                            | `sed -i ''`                                          |
| In a session started with worktree isolation, Claude Code refuses compound commands, heredocs and text naming git | Each git command alone; files through the edit tools |

- **Claude Code auto mode.** Its classifier denies, scratchpad included, installing a package the lockfile lacks, running downloaded code, and deleting a file that existed before the session with changes no commit holds, unless the user's message names that action. Read the code's source instead of running it; move a replaced file to its successor's path instead of deleting it; otherwise ask the user to name the action, or, as a subagent, report it for your caller.
