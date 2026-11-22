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

- why: #654: walker context 65k→214k, ~75% of cost re-reading; main sessions are 43% of cost, starting at 65k, mostly harness (#809).
- want: walks: `autoCompactWindow` (≥100k), PreCompact stdout keeping segment gists and pending handoffs.
- want: interactive: one short `/compact` offer per threshold crossing; a smaller harness start (plugins, MCP servers).

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

- why: a bare `#676` in a client repository's ancestor resolved against that repository; `Open questions` Blockers stayed after `gh issue edit` removed **Planning**, until claim and publish.
- want: ancestors resolved against the issue's own repository; the Blockers check reading the body too.

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

## 25. The implement skill's report kinds omit the budget stop

- sites: `data/metalbrain/skills/implement.md:93`
- why: §Finishing lists a completion or a blocked report; `Budget stop:` lives only in Analysis › Budget levels.
- want: the skill names it, or defers to the shared rule.

## 26. Run records cannot tell blocked reports or every planner mode

- sites: `src/tools/agents/utils/summarizeAgentTask.ts:39`, `src/tools/agents/utils/summarizeAgentTask.ts:46`
- why: blocked reports open with no marker, so run records count them as completions; planner briefs state their mode as a bare word, read from its first occurrence.
- want: a `Blocked:` report opening and a `Mode:` brief line in the instructions, then their detection.

## 27. Open questions on token spend from #771

- why: #771 closed with these open; desktop base context is ~43k tokens against the CLI's 22k (#791).
- want: a decision on each: a hook flagging `gh issue view` on drafted issues and long outputs, or wording; a "batch independent calls" rule for every agent; which base-context parts to disable; mergers on Sonnet (#809 H9).

## 28. `agents stats --all` costs disagree between role and model views

- why: at the #785 review, gatherers showed $0.48 but Haiku $0.18 over the same 10 runs; cause unchecked: per-model pricing, runs without a model, or a role/model join.
- want: both views summing to the same cost for the same runs, or the difference named in the output.

## 29. Forked sessions count their shared opening twice in run records

- why: 6 session pairs in `.ai/stats/` share their opening transcript; about $21.6, 2% of main cost, counted twice by `agents stats`.
- want: a forked session's record counting only what follows the fork.

## 30. No hook catches unquoted globs in Bash calls

- sites: `data/metalbrain/sections/shell.md:13`
- why: 12 friction lines on unquoted `grep --include=*.ts` despite the Shell rule; wording does not fix it.
- want: a PreToolUse Bash check warning on an unquoted glob argument.

## 31. Consultant freshness forces fresh consultants mid-walk

- sites: `data/metalbrain/skills/planning.md:15`, `src/tools/agents/operations/checkAgentResume.ts:61`
- why: `freshness: 2` refused resumes in walk df67d597, which spent 47% on 8 fresh consultants; raising it re-writes the whole context per resume on the 5-minute cache (#809).
- want: an absolute context ceiling, a small consultant agent file, the walker batching contacts.

## 32. The budget hook's stop path has never fired on a worker

- why: landed 2026-11-20 (`6331641f3`); none of the 44 workers since crossed 120k (max 117.7k), while 11 of 99 before it did unstopped.
- want: a fixture or replay run proving a worker past the threshold budget-stops with a passing tree.

## 33. Self-hosted hooks go off while an agent refactors the checkout

- sites: `.claude/settings.json:33`
- why: the hook command falls back to `bin/engrenage-hook/executable.ts` on the working `src`; during #809 pass 1, a removed `findIssueAudience.ts` still imported elsewhere turned every PostToolUse hook into "did not run, so its checks are off" for all sessions on the checkout: dispatch, budget, resume and stop gates included.
- want: hooks in this repository run from a stable build or a pinned commit, not the tree under edit; or refactors dispatched only with worktree isolation.

## 34. The Codex setup is unused and half done

- why: created early, no longer used; it silently misbehaves (e.g. Codex never loads the issue-drafts rule its consultant points to). S.25 defers its removal until #809's spec lands.
- want: remove the Codex agents, skills, sync targets and the instructions naming Codex, with the backlog entries only Codex needs.

## 35. The integration merger never checks that concurrent leaves agree

- why: workers now name `Concurrent:` leaves sharing a Model section, but the merger is not told which landed leaves shared one, so diverging shapes pass (H6, N.3.6).
- want: decide whether the merger checks the shared section against each `Concurrent:` sibling at integration.

## 36. Walk tuning awaits the first spec walks

- why: #809 S.26 moved its Q.6 and D.2 out so it can close; each needs live spec-walk evidence (Q.5).
- want: from the first walks' measurements, decide K = 3, the leaf floor, worker continuity across leaves (H10), and whether one central walker with sequential chains in one agent and few parallel writers holds (G1, G2).
- done: each decided, or dropped as unneeded by the walk data.
