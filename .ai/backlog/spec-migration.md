# spec-migration

Breakage the #809 spec-leaf migration knowingly causes (S.18): what is expected to break and what must be handled before walks resume.

## 1. Every existing plan holding Steps is refused at dispatch

- why: the dispatch hook refuses any issue with **Steps** (P.3.3); 57 open issues hold them (engrenage 48, toolkit 2, interscript 7), under #675, #732, #338, #308 and 11 standalone.
- want: the P.3.2 sweep (planning skill › Steps migration) converts them, each batch reviewed by the user; toolkit and interscript at their sync (P.3.4).
- done: no open issue holds **Steps**; then delete `steps-migration.md` and the planning section loading it.

## 2. Leaves under a published segment without Done when are refused

- why: `planning issue check` requires **Done when** on segments and checks ancestors (S.8), so every leaf under an older segment fails readiness.
- want: the P.3.2 sweep writes each open segment's **Done when** per the issue-drafts rule.

## 3. The walker still follows the Steps-era flow until batch 3 lands

- sites: `data/metalbrain/skills/walking.md:75`, `data/metalbrain/skills/walking.md:101`, `data/metalbrain/skills/walking.md:118`, `data/metalbrain/skills/shape/drafting.md:5`
- why: routing names **Steps**, sends `Scope stop:` to the consultant as a size split (now `Budget stop:`), reviews against **Steps**; reshape still starts a full planner; drafting still loads `steps-migration.md`.
- want: batch 3 (walking, merging, housekeeping, curation) rewrites them with no Steps routing (S.18).

## 4. The consultant still runs as the `planner` agent

- why: its own agent file (M.6.1) and absolute context ceiling (M.6.4, M.13.7) need `src/tools/agents/constants.ts` `plannerModes`, run records, Codex dispatch text and `checkAgentResume.ts`; the walker briefs `planner`.
- want: the consultant agent with its ceiling, the walker briefing it.

## 5. Tooling still accepts the dropped `reshape` planner mode

- sites: `src/tools/agents/constants.ts:210`, `src/tools/agents/codex/operations/createCodexDispatch.ts:69`
- why: batch 3 dropped reshape from the instructions (M.5.4); `plannerModes` and the Codex dispatch text still name it, so a reshape brief passes the hooks with no instruction behind it.
- want: `reshape` removed from both, with the consultant agent work of entry 4.
