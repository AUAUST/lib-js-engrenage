# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. Attribution rule conflicts go unreported

- sites: `src/tools/agents/setup/syncAgentFiles.ts:56`
- why: a rule file at the wanted path without its reference silently drops the rule.
- want: sync reports the conflict.

## 2. Walked agents read whole plan issues for the sections their header names

- why: over 20 walks, `gh issue view` was 14% of worker tool output, mostly whole plans re-read by each leaf.
- want: a `planning issue` command printing an issue with only the ancestor sections its header names, for workers and debuggers.

## 3. `walk check` reprints the whole tree after every commit

- why: the walker runs it after each commit; closed subtrees and their `Closes` lines grow with the walk and stay in its context.
- want: an option collapsing closed subtrees to one line, used by the walking skill once trees reach dozens of issues.

## 4. `planning issue check` passes underspecified items

- why: it checks section presence and order only.
- want: a finding per **Steps** item naming no path or identifier in code spans, and per **Tests** case without an expected outcome.
- done: obsolete once #809's spec leaves land; then a finding per leaf without **Done when** or a contract line per dependent.

## 5. Whether an issue's text counts as consent to change instructions is undecided

- why: maintenance requires user consent, precedence lets issues carry maintainers' decisions; walked workers get issues editing `data/metalbrain/`, and the writer skill's "Commit nothing" clashes with their checkpoints.
- want: user decision; proposed: session or maintainer-issue consent; the fallback keeps the role's commit rules.

## 6. Skills have no rank against the project's own rules

- why: `precedence.md` says a skill refines these instructions, but skills are shared text (rank 3) acting on project rules (rank 2).
- want: user decision; proposed: a skill refines shared rules for its role; project rules still win.

## 7. Always-loaded context carries rules only some edits need

- why: the TypeScript section and structure design rows (~110 words each) load for every agent; cold starts are a third of worker and planner cost (#654); a `paths` rule misses files written without a matching Read.
- want: accept that leak or move them to `code-style.md` and a project-map rule.

## 8. The planning sheet misses agents that write a draft before reading one

- why: `.claude/rules/issues.md` says it "loads with the first draft you read"; with `.ai/issues/` empty or listed through Bash, the first draft is a Write, which loads no `paths` rule.
- want: the issues rule has drafting agents Read `.claude/rules/planning-sheet.md` before their first draft unless a draft read loaded it.

## 9. Codex has no low-effort merger for integration

- why: `walking.md` dispatches the integration merger with `effort: low`; `merging.md` declares no `efforts`, and a Codex profile's effort overrides the spawn's.
- want: `efforts: { integration: low }` in the merging frontmatter, generating `merger_low`, routed by mode; merger effort stated once, today `medium` in the frontmatter against `low` in walking › Integration.

## 10. A restarted walk holds completed leaf work instead of integrating it

- why: walking › Stops and restarts holds every leaf branch it finds; a completed leaf waits on the user, its agent gone.
- want: route completed held work to §Integration or §Review with a new agent; its `snap` commit never lands as a checkpoint.

## 11. The walker has no rule for colliding log appends or silent agents

- why: parallel leaves' `.ai/friction.md` appends conflict when applied; nothing follows 3 unanswered progress requests.
- want: keep both sides of log conflicts; hold the leaf after 3 more silent timeouts.

## 12. Flaky gate failures and the walker's resume count have no rule

- why: load timeouts fail the stop gate transiently, and walking's resume limit counts any gate failure (friction ×3).
- want: rerun the gate once before reporting; failures outside the leaf's change are no resume cause.

## 13. A question asked mid-task can end the task

- why: the decision protocol's question row stops at answering; a literal agent answers and leaves its work half done and uncommitted.
- want: the row ends "then continue the task in progress".

## 14. Concurrent worktree agents' backlog entries collide when applied

- why: Backlog has editing agents record out-of-task bugs at once; two leaves numbering a new entry in one category conflict on cherry-pick or apply, and `worktree-dispatch.md` › Committing work keeps only the agent logs apart.
- want: a rule or merge step for backlog appends, like the agent logs'.

## 15. Instruction sync keeps or drops rules silently

- sites: `src/tools/agents/setup/syncAgentFiles.ts:95`, `src/tools/agents/setup/syncAgentFiles.ts:148`, `src/tools/agents/setup/syncAgentFiles.ts:241`, `src/tools/agents/operations/getInstructionTemplates.ts:91`, `src/tools/agents/operations/migrateInstructionLocations.ts:34`
- why: removed extensions leave rules installed; merged former rules lose project lines; upgrades confuse deleted and new default rules; unknown `extension` hides fragments; external former markers stay unresolved.
- want: sync reports or fails each. Related: #699.

## 16. Instruction markers have no single definition

- sites: `src/tools/agents/utils/listReferences.ts:4`, `src/tools/agents/utils/filterConditionalBlocks.ts:8`
- why: `listReferences` counts markers inside code, unlike `listInstructionMarkers`, while `syncBlocks` fills both; the filter guesses blank lines around markers without parsing Markdown.
- want: one Markdown-aware marker reader.

## 17. Agents guess the repository from the package name

- why: friction ×3 (`AUAUST/engrenage` instead of `AUAUST/lib-js-engrenage`), once after `.claude/rules/github.md` took `--repo` from the planning sheet; dispatch briefs and `gh api graphql` owner/name arguments are outside that rule's wording.
- want: the rule covering every repository argument, or a hook naming the registered repository on a 404 for an unregistered one.

## 18. Scratch scripts cannot import the project's packages

- why: friction ×3: ESM resolves bare specifiers from the script's directory, so `prettier` or `eslint` imported from a scratchpad `.mjs` fails; agents use absolute `node_modules` paths or `node --input-type=module -e` from the root.
- want: the Environment table naming the working form.

## 19. AGENTS.md cannot name a shared file's path for every runtime

- sites: `data/metalbrain/sections/analysis.md:21`, `data/metalbrain/sections/analysis.md:38`, `data/metalbrain/sections/analysis.md:44`
- why: `@shared-file` renders only in a skill, so section pointers name one skill's copy in `@file` blocks: the analysis method's Claude-only, `dispatching.md`'s lost without the shape skill.
- want: a section-level filler rendering the installed path of a shared file for the reading runtime.

## 20. Dropping an agent's work in the main checkout loses its pending debt markers

- sites: `data/metalbrain/shared/worktree-dispatch.md:39`
- why: reported by a writer: the reset discards the agent's files, markers included; only the friction and discarded logs carry over.
- want: their markers carried over as backlog entries, or a stated reason to drop them.

## 21. Out-of-reach copies of the record-before-telling rule lag behind it

- sites: `data/metalbrain/skills/walking.md:114`, `data/metalbrain/rules/issues.md:30`
- why: the agent-records rule now covers findings told in chat and those an agent reports; walking §Review still names only missed debt, and issues › Recording restates the chat rule for analysis and planning.
- want: both pointing at the agent-records rule.

## 22. No hook reminds a main session of records due at turn end

- why: proposed by the writer: a Stop hook injecting a records reminder when the turn's tool calls hold refused hooks or permissions; findings told only in chat stay prose-only.
- want: a decision on that hook.

## 23. The issue-drafts section budgets lag the configured defaults

- sites: `data/metalbrain/rules/issue-drafts.md:74`
- why: its table states Goal ~60, Context ~80, Done when ~60, while `defaultBudgets` in `src/tools/agents/constants.ts` became 150 each in 0fd960a2; a project's configured budgets can differ from both.
- want: the rule rendering the configured values through an `agents.fillers` filler, as `agent-limits` does, also for the budgets rule.

## 24. Shape's per-pool K leaves a writer's checkout unsettled

- sites: `data/metalbrain/skills/shape.md:17`, `data/metalbrain/shared/worktree-dispatch.md:10`
- why: worktree dispatch puts agents in the main checkout at K = 1; shape's writers pool has K = 1 beside implementers at 2, so a writer may edit the main checkout while worktree work is cherry-picked or reviewed gaps are closed there.
- want: shape stating which checkout each pool's agents use.

## 25. Handoffs and carry-overs travel as text an orchestrator rereads and repeats

- why: a walker reads each worker, planner and merger report and restates the parts it forwards, and the carried text stays in its context every turn.
- want: handoffs and carry-overs written to files, the orchestrator receiving and forwarding only their paths.
- done: measured first: fewer tokens than inline handoffs, counting the rereads skipped each turn; dropped otherwise, since saving tokens is its only purpose.

## 26. The commit-type table diverges from #218's decisions

- sites: `data/metalbrain/rules/git.md:31`, `src/tools/git/constants.ts:98`
- why: #218 › Decisions merge `files` into `cq`, split `ci` from `meta` and gate `css` and `content` by project traits; the table does none of it and adds `snap`, `config` and `debug`, which no decision names. #213 cannot write "today's table, amended by #218" until one wins.
- want: the user settles the authoritative vocabulary on #218.

## 27. Hard rules stay prose where a check could enforce them

- why: #809 D.9; S.38 keeps prose beside a check only for rules agents' default behaviour often breaks. The message gate, `git push` deny, local-files, suppressions and shell-trap checks took the rest of their prose (S.39).
- want:
  - eslint-comments description, `consistent-type-definitions` undecided
  - mutable-list aliases; allowed comment kinds: custom lint rules

## 30. No agent record holds required work left outside a pass

- why: friction and discarded logs record costs and rejected options, not follow-ups; e.g. a command changed while instructions still name its old shape, or instructions naming a state not yet built (#815). Such work is lost unless the agent opens a backlog entry by judgment.
- want: a third record beside friction and discarded, a live "todo" ledger, `- <subject>: <what must be done> — <why it was left>`, written as found; entries leave once an issue, entry or change takes them up.
- done: the agent-records rule defines it and the record exists.
