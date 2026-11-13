# agents

Agent runtime integrations: hooks and runtime names.

## 1. Agent runtime and hook matching are brittle

- sites: `src/tools/agents/utils/isHookCommand.ts:1`, `bin/engrenage/agents/codex/hook/actions/github.ts:20`, `src/tools/agents/utils/filterAgents.ts:5`
- why: `isHookCommand` is hardcoded; the Codex github hook action repeats the Claude one except payload schema and runtime name; narrowing a contributed name to `Agent` holds only while every `agents.runtimes` contribution augments `Engrenage.AgentRuntimes`.
- want: hook matching from the hook definitions; one github action owning both payloads; runtime names checked against the augmentation at load.

## 2. Info lint messages for Codex edits

- sites: `src/tools/agents/claude/constants.ts` (`PostToolUse` lint hook), `src/tools/agents/codex/`
- why: Claude gets `info` lint messages after each edit (#526); Codex declares no `PostToolUse` hook.
- want: check whether Codex hooks fire after file edits with an equivalent of `additionalContext`; if so, add the same lint hook for Codex.
