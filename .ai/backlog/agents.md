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

## 4. Nothing bounds a main session's context in a long run

- why: #654: walker context 65k→214k, ~75% of cost re-reading; no hook can start a compaction.
- want: walks: `autoCompactWindow` (≥100k) plus PreCompact stdout "gist of past segments, pending handoffs verbatim"; test it on `auto` triggers.
- want: interactive: once per threshold crossing, the check hook tells the agent to offer a short `/compact` prompt: impactful and recent facts, pending work verbatim.

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

## 11. Nothing catches a subagent stopping with unlogged friction

- why: of 8 subagents meeting refusals and retries in one session, one logged friction.
- want: a SubagentStop check blocking the first stop when the transcript holds refused or failed tool results and `.ai/friction.md` is unchanged, leaving out failures the agent's own changes caused.

## 12. Hook routers duplicate payload handling and swallow failures

- sites: `bin/engrenage-hook/claude/actions/preToolUse.ts:5`, `bin/engrenage-hook/codex/actions/preToolUse.ts:5`, `bin/engrenage-hook/claude/actions/postToolUse.ts:52`, `src/tools/agents/operations/reportBudgetFindings.ts:25`, `src/tools/agents/operations/checkAgentHooks.ts:25`
- why: both routers repeat the payload schema and stdin read; post-edit failures (broken config, ESLint crash) vanish; every hook writes its own stdout JSON; `checkAgentHooks` clones `syncHooks`' schema (jscpd).
- want: one hook-output writer and shared hook schemas; failures reported without disturbing the session.

## 13. The hook directory is resolved twice, in shell and in Node

- sites: `src/tools/agents/utils/createHookCommand.ts:4`, `src/tools/agents/utils/resolveHookDirectory.ts:5`
- why: the shell walk restates `findRepositoryRoot` and bounds the root by markers; both cut at `node_modules` by hand.
- want: the config lookup skipping dependencies, read by both.

## 14. Legacy hook shims wait for consumers to sync

- sites: `bin/engrenage/agents/claude/hook.ts:5`, `bin/engrenage/agents/codex/hook.ts:5`, `src/tools/agents/codex/constants.ts:23`
- why: they keep settings synced before `engrenage-hook` working; the two shims clone each other (jscpd).
- done: consumers have synced past the release introducing `engrenage-hook`; then delete them.

## 15. Runtime behaviour branches on runtime names

- sites: `src/tools/agents/operations/checkAgents.ts:24`, `src/tools/agents/operations/getSkillTemplates.ts:69`, `src/tools/agents/operations/getSkillTemplates.ts:137`, `src/tools/agents/operations/migrateSkillFiles.ts:225`, `src/tools/agents/utils/createDispatchEnvironment.ts:7`, `src/tools/agents/config/schemas/skillSchema.ts:35`
- why: directories, frontmatter keys, agent file format, session variables and tool names are hand-coded for Claude and Codex, so a contributed runtime gets Codex's shape and leaks variables.
- want: the `agents.runtimes` contribution declares each; per-runtime renderings in separate fields.

## 16. The Codex provenance line has two owners

- sites: `src/tools/agents/codex/operations/syncCodexSkill.ts:60`, `src/tools/agents/operations/migrateSkillFiles.ts:25`
- why: built in `syncCodexSkill` and `createCodexAgentProfiles`, parsed in `migrateSkillFiles`, ownership judged again in `checkAgents`, which ignores former provenances.
- want: one owner of the format and the ownership test.

## 17. Agent usage records rest on undocumented Claude transcripts

- sites: `src/tools/agents/claude/operations/readClaudeTranscript.ts:68`, `bin/engrenage-hook/claude/actions/record.ts:34`
- why: a format change silently zeroes the counters; `SubagentStop` fires for agents without a transcript, so a missing one is skipped unidentified.
- want: format drift detected and reported. Related: #319.

## 18. Dispatch and resume checks read the wrong names

- sites: `src/tools/agents/operations/dispatchAgent.ts:40`, `src/tools/agents/operations/checkAgentResume.ts:74`
- why: briefs are checked against the caller's contract names, not the target checkout's; a recipient that is no agent id resolves by role name, so other names escape the resume limit.
- want: the target's contract names; recipients resolved to agent ids.

## 19. The Claude settings prompt lists raw hook matchers

- sites: `src/tools/agents/claude/setup/createClaudeSettingsStep.ts:15`
- want: the prompt names what each hook checks.

## 20. The worker dispatch hook misreads cross-repository ancestors and stale fields

- why: friction ×4, two from these: a bare `#676` in a client repository's ancestor resolved against that repository; `Open questions` Blockers stayed after **Planning** was removed by `gh issue edit`, until claim and publish.
- want: ancestor references resolved against the issue's own repository; the Blockers check reading the body, not only the field.

## 21. One init or sync run rebuilds the same agent templates and skill definitions many times

- sites: `src/tools/agents/operations/fillAgentLimits.ts:6`
- why: a Codex init calls `getInstructionTemplates` 48 times; the frontmatter memo removes only reparsing, not rereading, validation or rendering.
- want: computed once per run and shared; a run lifecycle contract to decide first.

## 22. An indented `@shared-file` marker is silently left unrendered

- why: block markers match at column 0 only, so an indented one in an agent fragment renders nothing and sync passes.
- want: sync rejecting marker-like indented lines in agent fragments.

## 23. The dispatch hook may let a `Draft:` brief holding **Housekeeping** through

- why: the hook denies Housekeeping issues read from `Issue:` lines; a shape dispatch from a draft may rely only on the worker-side stop in the implement skill.
- want: the hook reading `Draft:` paths too, or a test showing it does.

## 24. The tool call log misses failed calls and some start times

- sites: `bin/metalbrain/hook/claude/index.ts:11`
- why: failed calls arrive as `PostToolUseFailure`, which is not hooked; async hooks let a fast call's PostToolUse read before PreToolUse writes, leaving no duration and a stale start file.
- want: failures logged; start times never lost or left behind.

## 26. The implement skill's report kinds omit the budget stop

- sites: `data/metalbrain/skills/implement.md:93`
- why: §Finishing lists a completion or a blocked report; `Budget stop:` lives only in Analysis › Budget levels.
- want: the skill names it, or defers to the shared rule.
