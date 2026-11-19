<!-- @reference @auaust/engrenage/metalbrain/skills/walking/cross-repository.md -->

# Cross-repository walks

Applies on top of the walking skill to foreign leaves, leaves of another registered repository, and to linked defects. Where a section here covers a step of the walking skill, it replaces that step; `walking §…` names the skill's sections, a bare `§…` this file's.

A foreign leaf runs, is reviewed and is committed in its linked checkout (walking §Handling table), under that repository's instructions and gates.

## Walk start

Before the first foreign dispatch, extending walking §Stops and restarts:

1. For each linked checkout of a repository holding a leaf of the tree, report its branch and uncommitted files, and list its `worker/issue-*`, `debugger/issue-*` and `debugger/review-*` branches, handled as walking §Stops and restarts handles them in the main checkout.
2. On its default branch, ask the user for the branch to work on, and switch the checkout to it, creating it from the current commit when absent; in autonomous mode, set that repository's leaves aside instead of asking.
3. Its `HEAD` starts its first review range (§Boundary reviews).

## Dispatch

- **Pool.** Foreign leaves count towards K; at most one agent in flight per linked checkout, mergers and debuggers included: `agents dispatch` has no worktree isolation.
- **Dispatch base.** The linked checkout's `HEAD` commit when you dispatch, recorded per leaf.
- **Start.** Write the brief walking §Dispatching or the merging skill's §Brief sets to a file outside both checkouts, then run in the background, or in the foreground under a client without background commands, `pnpm engrenage agents dispatch <checkout> --client <your runtime: claude or codex> --agent <worker|debugger|merger> --brief <file>`, adding `--effort <level>` when the `complexity` row gives one. Its output holds a `Session:` line, a `Denied:` line when tools were denied, and the agent's final report.
- **Resume.** Write the message to a file, then run `pnpm engrenage agents dispatch <checkout> --client <your runtime> --resume <session> --brief <file>`.
- **Denied tools.** Treat each tool on the `Denied:` line as an action a permission refused (walking §Dispatching, light gap): name it in the commit line.

## Review and commit

- **Review.** By walking §Review at any K, never through an integration merger, reading the diff with `git -C <checkout> diff` against the dispatch base.
- **Commit.** Walking §Commit without its worktree steps: no cherry-pick, apply or worktree removal. Run every git command with `git -C <checkout>`, staging by path; the closing commit closes only that repository's issues. When the commit fails, resume the agent with the gate's failing commands and output.
- **Walked-repository parent.** One the commit leaves with no open sub-issue closes with the next commit in the walked checkout: when no walked-repository leaf commits before that parent's boundary review, an empty commit made before that review.
- **Branch.** Leave the checkout on the branch §Walk start set, never its default branch.

## Holding and dropping

- **Holding.** Walking §Holding a leaf, step 1 runs in the leaf's linked checkout.
- **Dropping.** Walking §Dropping a leaf's work, with step 2 run in the linked checkout instead of the main checkout: switch back to the branch §Walk start set when on another one, reset it to the leaf's dispatch base and discard the files the leaf changed or added. Step 3 appends to that checkout's logs, left uncommitted for its next commit.

## Linked defects

On a worker report opening with `Linked defect:`, from any leaf:

1. Drop the leaf's work under walking §Dropping a leaf's work, through §Holding and dropping when the leaf is foreign.
2. Dispatch a new debugger in the walked checkout, as a walked-repository leaf's agent, never through §Dispatch, the leaf foreign or not. Brief it with the `Walk:` line, then `Leaf: <owner>/<repo>#<n>` naming the leaf, then the worker's report, and no `Issue:` line.
3. Handle its outcome by walking §After a debugger: `walk check` routes the sub-issue it files before the leaf.

## Boundary reviews

For each linked checkout holding foreign leaves committed since its previous review run or the walk's start, run walking §Boundary reviews, steps 1–3, there as well: the merger and its debugger dispatched in that checkout through §Dispatch, the merger briefed with that checkout's range since its previous review run, and the commit made there.

<!-- @end -->
