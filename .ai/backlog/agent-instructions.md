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

- why: it checks section presence and order only; items whose **Steps** left choices open surfaced mid-walk. The planning skill's §Readiness states the bar in prose.
- want: a finding per **Steps** item naming no path or identifier in code spans, and per **Tests** case without an expected outcome.

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
- want: `efforts: { integration: low }` in the merging frontmatter, generating `merger_low`, routed by mode.

## 10. A restarted walk holds completed leaf work instead of integrating it

- why: walking › Stops and restarts holds every leaf branch it finds; a completed leaf waits on the user, its agent gone.
- want: route completed held work to §Integration or §Review with a new agent; its `snap` commit never lands as a checkpoint.

## 11. The walker has no rule for colliding log appends or silent agents

- why: parallel leaves' `.ai/friction.md` appends conflict when applied; nothing follows 3 unanswered progress requests.
- want: keep both sides of log conflicts; hold the leaf after 3 more silent timeouts.

## 12. Flaky gate failures and the walker's resume count have no rule

- why: the stop gate blocks only the first stop and has failures listed without edits, but load timeouts fail it transiently and walking's resume limit counts any gate failure (friction ×3).
- want: rerun the gate once before reporting; the walker counts failures outside the leaf's change as no resume cause.

## 13. A question asked mid-task can end the task

- why: the decision protocol's question row stops at answering; a literal agent answers and leaves its work half done and uncommitted.
- want: the row ends "then continue the task in progress".

## 14. Concurrent worktree agents' backlog entries collide when applied

- why: Backlog has editing agents record out-of-task bugs at once; two leaves numbering a new entry in one category conflict on cherry-pick or apply, and `worktree-dispatch.md` › Committing work keeps only the agent logs apart.
- want: a rule or merge step for backlog appends, like the agent logs'.

## 15. Instruction sync keeps or drops rules silently

- sites: `src/tools/agents/setup/syncAgentFiles.ts:74`, `src/tools/agents/setup/syncAgentFiles.ts:131`, `src/tools/agents/setup/syncAgentFiles.ts:222`, `src/tools/agents/operations/getInstructionTemplates.ts:91`, `src/tools/agents/operations/migrateInstructionLocations.ts:34`
- why: a removed extension leaves its rules installed; a merged former rule loses its project lines; an upgrade cannot tell a deleted default rule from a new one; an unknown `extension` hides a fragment; external extensions' former markers stay unresolvable.
- want: each case reported or failed by sync. Related: #699.

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
