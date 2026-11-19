# claude-code

Upstream Claude Code harness behavior.

## 1. The worktree isolation guard refuses commands that only name git

- why: worktree sessions refuse Bash commands holding a `github` path, a `git.ts` name, heredocs or chains (friction ×6); agents split calls or edit through scripts.
- want: refusals limited to git invocations, or a hook naming the accepted form first.
