# claude-code

Upstream Claude Code harness behavior.

## 1. The worktree isolation guard refuses commands that only name git

- why: worktree sessions refuse Bash commands holding a `github` path, a `git.ts` name, heredocs, chains, `sed -i`, `git mv` loops or `$(git …)` (friction ×15); agents split calls, use the edit tools or rename strings.
- want: refusals limited to git invocations; meanwhile a hook or the worktree instructions naming the accepted form first (writer deferred by the user, 2026-11-20).
