<!-- @reference @auaust/engrenage/metalbrain/skills/walking/cross-repository.md -->

# Cross-repository walks

Applies on top of the walking skill to foreign leaves, leaves of another registered repository, and to linked defects. Where a section here covers a step of the walking skill, it replaces that step; `walking §…` names the skill's sections, a bare `§…` this file's.

A foreign leaf runs, is reviewed and is committed in its linked checkout (walking §Handling table), under that repository's instructions and gates, by this file, which replaces steps of `worktree-dispatch.md` as it states; read it with this one:

`.claude/skills/walking/linked-checkouts.md`

## Walk start

Before the first foreign dispatch, extending walking §Stops and restarts:

1. Start each linked checkout of a repository holding a leaf of the tree by `linked-checkouts.md` › Starting, its hold branches the `worker/issue-*`, `debugger/issue-*` and `debugger/review-*` ones; in autonomous mode, set that repository's leaves aside instead of asking for its branch.
2. Its `HEAD` starts its first review range (§Boundary reviews).

## Dispatch

- **Start and resume.** By `linked-checkouts.md` › Dispatch, the brief being the one walking §Dispatching or the merging skill's §Brief sets, `--agent` being `worker`, `debugger` or `merger`, and `--effort` given when the `complexity` row gives one.
- **Denied tools.** Handle each as a light gap a permission refused (walking §Dispatching): name it in the commit line.

## Review and commit

- **Review.** By walking §Review at any K, never through an integration merger, reading the diff as `linked-checkouts.md` › Review and commit states.
- **Commit.** Walking §Commit, through `linked-checkouts.md` › Review and commit.
- **Walked-repository parent.** One the commit leaves with no open sub-issue closes with the next commit in the walked checkout: when no walked-repository leaf commits before that parent's boundary review, an empty commit made before that review.

## Housekeeping

A foreign issue's **Housekeeping**: walking §Housekeeping in its linked checkout, once no agent is in flight there, running each command from that checkout and each git command with `git -C <checkout>`; its commit by §Review and commit.

## Holding and dropping

Hold and drop a foreign leaf's work by `linked-checkouts.md` › Holding and dropping.

## Linked defects

On a worker report opening with `Linked defect:`, from any leaf:

1. Drop the leaf's work under `worktree-dispatch.md` › Dropping work, through §Holding and dropping when the leaf is foreign.
2. Dispatch a new debugger in the walked checkout, as a walked-repository leaf's agent, never through §Dispatch, the leaf foreign or not. Brief it with the `Walk:` and `Base:` lines, then `Leaf: <owner>/<repo>#<n>` naming the leaf, then the worker's report, and no `Issue:` line.
3. Handle its outcome by walking §After a debugger: `walk check` routes the sub-issue it files before the leaf. When it filed none, the defect lying in a repository neither current nor registered, set the leaf aside instead of dispatching it again, and report it with the backlog entry the debugger wrote.

## Boundary reviews

For each linked checkout holding foreign leaves committed since its previous review run or the walk's start, run walking §Boundary reviews, steps 1–3, there as well: the merger and its debugger dispatched in that checkout through §Dispatch, the merger briefed with that checkout's range since its previous review run, and the commit made there.

<!-- @end -->
