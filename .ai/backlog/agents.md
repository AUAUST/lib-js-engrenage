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

- why: supporting files name the main skill's sections as `<skill> §Name`; a bare one reads as a missing section of the file.
- want: a check flags a bare `§Name` in a supporting file that names no section of that file.

## 7. Codex cannot dispatch the analyser at a requested effort

- why: Codex picks effort through profiles generated from `efforts:`, keyed by issue `complexity`; the analyser has only its `medium` default, so a user-requested high dispatch has no profile. Claude Code and `agents dispatch --effort` work.
- want: an effort override on Codex dispatch, or profiles for requested efforts.

## 8. Nothing checks that fragments name existing skills

- why: renaming `issue-implementation` to `implement` left references in `walking.md` and `planning.md` that only a grep caught.
- want: sync fails on a fragment naming a skill that does not exist or appears only in a `formerly` list.

## 9. Nothing checks references between shared skill files

- why: `linked-checkouts.md` relies on `worktree-dispatch.md`, and `.claude/rules/agent-fragments.md` asks every skill referencing the first to reference the second; `<file>.md › <Section>` references are unchecked too.
- want: sync fails on a shared file naming one its referencing skill lacks, and on a section reference to a missing section.

## 10. The resume hook names the walking skill

- sites: `src/tools/agents/operations/checkAgentResume.ts:107`
- why: the refusal says "briefed as walking §Resumed agents states"; right while only the walker resumes agents with a freshness limit.
- want: a message naming the dispatching skill generically once another skill resumes such agents.
