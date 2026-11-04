# agent-instructions

Shared agent instructions, skills and the backlog conventions.

## 1. The `git.md` rule fragment should prefer commas over "and" when listing.

- why: it says to name what changes have in common when "and" would be needed, but not to separate list items with commas.
- done: the shared git rule states it and `pnpm engrenage sync agents` has propagated it.

## 2. `AGENTS.md` describes the pre-#141 module layout.

- why: the project map says `config/` holds definers and `utils/` "every other function" and omits `operations/`; it says logic lives in `config/` and `utils/`; it names `tests/helpers/` (now `tests/utils/`).
- done: #152 rewrites the instructions and `pnpm engrenage sync agents` has propagated them.

## Stale after #180

- why: AGENTS.md says to run `pnpm build:tsdown`, a script `package.json` lacks (`pnpm build` runs `engrenage tsdown`); its project map still describes the pre-namespace `src/` layout (rewrite: #152).
- done: the build command and project map match the repository.

## Stale after #143

- why: `.ai/debt.md` cites `src/workflows/cli/operations/resolveBinary.ts` (now `src/foundation/processes/operations/resolveBinary.ts`) and `createStepContext.ts` line numbers (7, 12, 20, 23, 117); AGENTS.md and the project map omit `project/steps`; plan §Config pipeline describes `StepContext` with `get`, true only after the operations question is settled.
- done: paths, maps and plan match the code.

## Stale after #143 round 2

- why: plan §Config pipeline says `StepContext<Sections>` replaces `config`, true except for the VS Code steps (via `loadInfoRules` → `createEslintConfig`); `@auaust/engrenage/config` no longer exports `ResolvedAgents`.
- done: the plan and exports description match.

## Stale after #143 round 3

- why: plan §Config pipeline shows `project/config` taking raw input once per root, while `readConfig` validates the whole config eagerly until steps 4 and 5 land.
- done: the plan and code agree.
