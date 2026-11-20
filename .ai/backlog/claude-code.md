# claude-code

Upstream Claude Code harness behavior.

## 1. The worktree isolation guard refuses commands that only name git

- why: worktree sessions refuse heredocs, chains, `sed -i`, loops and any command naming git, even a `github` path (friction ×15); agents split calls or use the edit tools.
- want: refusals limited to git invocations; meanwhile a hook or the worktree instructions naming the accepted form first (writer deferred by the user, 2026-11-20).
