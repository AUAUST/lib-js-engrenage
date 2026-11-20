# Linked checkouts

Working from your session in the checkout of another registered repository: linking it, and starting, resuming, committing, holding and dropping agents' work there. Applies on top of `worktree-dispatch.md`: where a rule here covers one of its steps, it replaces that step; `§…` names this file's sections.

A repository's linked checkout is the directory `pnpm engrenage link` lists for it. An agent there works under that repository's instructions and gates.

## Linking

Create or remove a link only on the user's request, or once they confirm one you propose; list or restore links whenever needed.

| Need                                                                                   | Command                                       |
| -------------------------------------------------------------------------------------- | --------------------------------------------- |
| Link a registered repository's installed package to its checkout, tracked files intact | `pnpm engrenage link <short name> <checkout>` |
| List the links with their state                                                        | `pnpm engrenage link`                         |
| Restore a linked repository's installed package                                        | `pnpm engrenage link --remove <short name>`   |
| Repoint every link at its checkout after an install                                    | `pnpm engrenage link --restore`               |

## Starting

Before the first dispatch into a linked checkout:

1. Report its branch and uncommitted files, and list its hold branches of the kinds your skill names, handled as your skill handles them in the main checkout.
2. On its default branch, ask the user for the branch to work on, and switch the checkout to it, creating it from the current commit when absent.

Leave the checkout on that branch, never its default branch.

## Dispatch

- **Pool.** At most one agent in flight per linked checkout, whatever its role: `agents dispatch` has no worktree isolation. Each counts towards its pool's K.
- **Dispatch base.** The linked checkout's `HEAD` commit when you dispatch, recorded per agent and briefed on the `Base:` line.
- **Start.** Write the brief your skill sets to a file outside both checkouts, then run in the background, or in the foreground under a client without background commands, `pnpm engrenage agents dispatch <checkout> --client <your runtime: claude or codex> --agent <name> --brief <file>`, adding `--effort <level>` when your skill gives one. Its output holds a `Session:` line, a `Denied:` line when tools were denied, and the agent's final report.
- **Resume.** Write the message to a file, then run `pnpm engrenage agents dispatch <checkout> --client <your runtime> --resume <session> --brief <file>`.
- **Denied tools.** Treat each tool on the `Denied:` line as an action a permission refused the agent.

## Review and commit

- **Review.** Read the diff with `git -C <checkout> diff` against the dispatch base.
- **Commit.** `worktree-dispatch.md` › Committing work without its steps for an agent in a worktree: no records set-aside, cherry-pick, apply, log copy or worktree removal. Run every git command with `git -C <checkout>`, staging by path; close only that repository's issues from it.

## Holding and dropping

- **Holding.** `worktree-dispatch.md` › Holding work, step 1 runs in the linked checkout.
- **Dropping.** `worktree-dispatch.md` › Dropping work, with step 2 run in the linked checkout instead of the main checkout: switch back to the branch §Starting set when on another one, reset it to the agent's dispatch base and discard the files the agent changed or added. Step 3 appends to that checkout's logs, left uncommitted for its next commit.
