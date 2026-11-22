<!-- @reference @auaust/engrenage/metalbrain/shared/worktree-dispatch.md -->

# Worktree dispatch

The lifecycle of each agent your skill dispatches under this file to change files: dispatch, resume, commit, hold and drop. Your skill sets K, the number of such agents in flight at once, what each brief holds, how the work is reviewed and what each commit holds; `§…` names this file's sections.

The working branch: the main checkout's branch your skill commits the agents' work to. An agent's work: the commits it made since its dispatch base and its uncommitted rest, reviewed as one diff from that base.

## Dispatch

- Dispatch every agent from the working branch's `HEAD` commit, its dispatch base, briefed on a `Base: <dispatch base>` line: at K = 1 in the main checkout; past it, each in the background with `isolation: "worktree"`.
- Resume the same agent to answer its question, return the gaps and findings of its review, or return the failing commands and output from its stop or commit gate.
- Resume an agent at most twice for one cause: a gate failure, a gap or finding, a blocked report on the same question, or a conflict reported as needing design. Instead of a third resume, hold its work under §Holding work.
- Complete an agent's work on its final report, a completion or a blocked report; never wait for a later agent-finished event, which may never wake you.
- Stay inactive between agent events: end your turn where the client wakes you, otherwise wait with its longest timeout. Never poll or sleep; request progress from the agents in flight only when a decision depends on it or after 3 consecutive timeouts with no agent event.

## Committing work

Each commit of an agent's work, made in the main checkout:

1. For an agent in a worktree, cherry-pick the commits it made since its dispatch base, then apply its uncommitted rest, both without its changes to `.ai/friction.md` and `.ai/discarded.md`, where both sides' appends conflict; never otherwise rewrite those commits. Bring its lines in those logs by §Dropping work, steps 1 and 3. When the main checkout holds uncommitted records (git rules › Commits), stash them by path before the cherry-picks and pop the stash after the apply: a cherry-pick refuses a dirty file it touches.
2. Make the commit your skill sets on the uncommitted rest, empty when none is left; the agent's own commits stay as they are.
3. When the commit fails, for an agent in a worktree first undo its work in the main checkout as §Dropping work, step 2, states, keeping its worktree; then resume the agent with the gate's failing commands and output.
4. Once the commit exists, remove the agent's worktree, when it has one, and write the backlog entries its report leaves you (`dispatching.md` › Backlog).

## Holding work

Moves an agent's work onto its own branch, so your work goes on from a clean tree:

1. In the agent's checkout, its worktree or the main checkout, create from the current commit and switch to the hold branch your skill names; when that branch exists, append the first free suffix of `-2`, `-3`, …. Commit there yourself, when any, the uncommitted files the agent changed or added, staged by path, as `snap` under the git rules.
2. Drop the agent's work under §Dropping work.
3. Report the held work's state and branch to the user at once, who may say how to proceed.

## Dropping work

Takes an agent's work off the working branch, keeping the new lines in `.ai/friction.md` and `.ai/discarded.md` and every change that is not the agent's:

1. Copy the lines those logs gained since the agent's dispatch base, whoever wrote them, from its hold branch when held, otherwise from its checkout.
2. Return the main checkout to the working branch as it stood before the agent:
   - **Agent in the main checkout.** Held, switch back to the working branch; otherwise discard the uncommitted files the agent changed or added. Undo its commits, when any: held, `git reset --keep <dispatch base>`, uncommitted records stashed by path around it, the hold branch keeping them; otherwise `git revert --no-edit <dispatch base>..HEAD`, since auto mode denies a reset past commits no other branch holds.
   - **Agent in a worktree.** In the main checkout, discard the applied rest by path, then undo its cherry-picks, when any, with `git reset --keep` to the commit before them: its worktree keeps the originals. Then remove the agent's worktree with `--force`, since it may hold uncommitted work.
3. Append the copied lines the main checkout's logs lack, left uncommitted for the next commit, and write the backlog entries the agent's report leaves you (`dispatching.md` › Backlog).

## Stopping

Stopping with agents' work not committed (Writing › Stop records): stop each agent in flight, then hold each one's work under §Holding work, steps 1–2, instead of a `snap` commit on the working branch. The stop record names each hold branch and whether its agent had completed.

<!-- @end -->
