# agents

Agent runtime integrations: hooks, runtime names and skill rendering.

## 1. Agent runtime names are checked only by type narrowing

- sites: `src/tools/agents/utils/filterAgents.ts:5`
- why: narrowing a contributed name to `Agent` holds only while every `agents.runtimes` contribution augments `Engrenage.AgentRuntimes`. Hook matching and the duplicated github action: #598.
- want: runtime names checked against the augmentation at load.

## 2. Info lint messages for Codex edits

- sites: `src/tools/agents/claude/constants.ts:49`, `src/tools/agents/codex/constants.ts:16`
- why: Claude gets `info` lint messages after each edit (#526); Codex declares no `PostToolUse` hook.
- want: check whether Codex hooks fire after file edits with an equivalent of `additionalContext`; if so, add the same lint hook for Codex.

## 3. `sync --check` fails on a stale `AGENTS.override.md` after a rebase

- why: Codex-generated override file goes stale when a rebase brings new instructions; out of the cleanup pass with Codex work (#613 › Decisions). Seen in AUAUST/lib-js-toolkit#325 › Gate.
- want: sync regenerates it, or `--check` names the command that does.

## 4. Nothing bounds the walker's context in a long walk

- why: #654: walker context climbed 65k→214k, ~75% of its cost re-reading; `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` is reported ignored in a `settings.json` `env` block, on recent versions and in bridge-attached sessions.
- want: an enforceable compaction or relay point at each segment close, relying on walking §Context's rebuild from `walk check`.

## 5. Sync accepts a skill naming its supporting file by bare name

- sites: `src/tools/agents/utils/createSkillFileFiller.ts:5`
- why: a bare `consultant.md` outside a `<!-- @skill-file -->` block escapes the path sync renders and validates; `data/metalbrain/skills/planning.md` Modes table still does.
- want: sync fails on a supporting file's name outside a `@skill-file` block of its skill.

## 6. Nothing flags a bare `§Name` in a supporting file pointing to its main skill

- why: supporting files name their own sections bare and the main skill's as `<skill> §Name`; a bare `§Name` matching only a main-skill section reads as a missing section of the file.
- want: a check flags a bare `§Name` in a supporting file that names no section of that file.
