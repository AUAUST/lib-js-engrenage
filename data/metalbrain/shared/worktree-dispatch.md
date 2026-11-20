# Worktree dispatch

The lifecycle of each agent your skill dispatches under this file to change files: dispatch, resume, commit, hold and drop. Your skill sets K, the number of such agents in flight at once, what each brief holds, how the work is reviewed and what each commit holds; `§…` names this file's sections.

The working branch: the main checkout's branch your skill commits the agents' work to.

## Dispatch

- Under Codex, K = 1, whatever your skill sets.
- Dispatch every agent from the working branch's `HEAD` commit, its dispatch base, briefed on a `Base: <dispatch base>` line: at K = 1 in the main checkout; past it, each in the background with `isolation: "worktree"`.
- Resume the same agent to answer its question, return the gaps and findings of its review, or return the failing commands and output from its stop or commit gate.
- Resume an agent at most twice for one cause: a gate failure, a gap or finding, a blocked report on the same question, or a conflict reported as needing design. Instead of a third resume, hold its work under §Holding work.
- Complete an agent's work on its final report, a completion or a blocked report; never wait for a later agent-finished event, which may never wake you.
- Stay inactive between agent events: end your turn where the client wakes you, otherwise wait with its longest timeout. Never poll or sleep; request progress from the agents in flight only when a decision depends on it or after 3 consecutive timeouts with no agent event.

## Committing work

Each commit of an agent's work, made in the main checkout:

1. For an agent in a worktree, cherry-pick the commits it made since its dispatch base, then apply its uncommitted rest, both without its changes to `.ai/friction.md` and `.ai/discarded.md`, where both sides' appends conflict, and both inside §Setting records aside, from `HEAD`; never otherwise rewrite those commits. Bring its lines in those logs by §Dropping work, steps 1 and 3.
2. Make the commit your skill sets, which stages the records with the agent's work.
3. When the commit fails, for an agent in a worktree first undo its work in the main checkout as §Dropping work, step 2, states, keeping its worktree; then resume the agent with the gate's failing commands and output.
4. Once the commit exists, remove the agent's worktree, when it has one.

## Setting records aside

Wraps a git operation in the main checkout touching files that hold records (git rules › Commits › Records), from a commit `<from>`, so the records stay uncommitted instead of needing a commit of their own: a cherry-pick or apply refuses a dirty file it touches, a reset or discard drops it.

1. Save the records' diff from `<from>` to the patch file `"$(git rev-parse --git-path records.patch)"`, then restore those files to `<from>`.
2. Run the operation.
3. Re-apply the patch with `git apply --3way`, keeping both sides' lines where it conflicts, then delete the patch file.

A patch file present before step 1: an earlier operation stopped before step 3; run step 3 first.

## Holding work

Moves an agent's work onto its own branch, so your work goes on from a clean tree:

1. In the agent's checkout, its worktree or the main checkout, create from the current commit and switch to the hold branch your skill names; when that branch exists, append the first free suffix of `-2`, `-3`, …. Commit there yourself, when any, the uncommitted files the agent changed or added, staged by path, as `snap` under the git rules.
2. Drop the agent's work under §Dropping work.
3. Report the held work's state and branch to the user at once, who may say how to proceed.

## Dropping work

Takes an agent's work off the working branch, keeping its lines in `.ai/friction.md` and `.ai/discarded.md`, the records pending before it and every change that is not the agent's:

1. Copy the lines those logs gained since the agent's dispatch base, whoever wrote them, from its hold branch when held, otherwise from its checkout.
2. Return the main checkout to the working branch as it stood before the agent:
   - **Agent in the main checkout.** Switch back to the working branch when on another one, then, inside §Setting records aside from the agent's dispatch base, reset it to that base, dropping the agent's commits, and discard the files the agent changed or added: its commits may hold records pending at its dispatch.
   - **Agent in a worktree.** Inside §Setting records aside, from the commit preceding the agent's cherry-picks, otherwise from `HEAD`, undo its cherry-picks and apply in the main checkout, when any, discarding only the files they changed; then remove the agent's worktree with `--force`, since it may hold uncommitted work.
3. Append the copied lines the main checkout's logs lack, left uncommitted for the next commit.

## Stopping

Stopping with agents' work not committed (Writing › Stop records): stop each agent in flight, then hold each one's work under §Holding work, steps 1–2, instead of a `snap` commit on the working branch, which agents' work reaches only through §Committing work. The stop record names each hold branch and whether its agent had completed.
