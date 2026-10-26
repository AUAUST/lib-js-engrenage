# AGENTS.md

Apply throughout the repository. Follow these rules in changed code; preserve unrelated work.

<!-- @reference @auaust/engrenage/agents/sections/instruction-maintenance.md -->

## Instruction maintenance

- Never modify AGENTS.md or `.claude/rules/` unless the user explicitly asks to change agent instructions. Finishing a feature, refactor or new convention does not authorize it; mention the suggested change in your report instead.
- A `<!-- @reference <reference> -->` marker opens a block that `engrenage agents sync` fills with the referenced file, up to the next `@reference` or `<!-- @end -->` marker. Never edit blocks in place: add project rules after an `@end` marker, or change the referenced source.
- AGENTS.md holds only rules every agent needs. Surface-specific detail lives in `.claude/rules/`, one file per surface. Neither holds feature documentation, file inventories, API details or records of recent changes.
- When a rule becomes mechanically enforced, list it under the matching "Enforced by tooling" line and keep prose only for what tools cannot check.

<!-- @reference @auaust/engrenage/agents/sections/precedence.md -->

## Precedence and conflicts

- Precedence: an explicit user decision for the current task, then the project's own instructions, then shared instructions from `@auaust/engrenage`, then existing code patterns. Existing code never justifies repeating a violation.
- When a request contradicts these rules, would create debt, or asks for an inappropriate abstraction, stop before implementing it: explain the issue and propose an alternative. If the user confirms, implement it as a one-time exception, never a precedent, and keep every other rule.
- When a conflict between rules, code and request has no clear resolution, ask instead of guessing.

<!-- @reference @auaust/engrenage/agents/sections/decision-protocol.md -->

## Decision protocol

Pause on real choices: ask the questions and wait for the answers before continuing. When pausing is impossible, end the turn with the questions rather than proceeding on a guess.

- Obvious choice: one option is clearly better and fits the established architecture. Proceed, and report the decision with the alternative you discarded.
- Real choice: options are comparably good, each has significant costs, or a needed architectural contract is missing. Finish only work no open question affects, then pause with the batched questions (options, trade-offs, your recommendation), a short done/pending/blocked state, and enough context that the reply can contain only the answers.
- Follow implications as far ahead as possible before pausing, so questions arrive together rather than one patch at a time.
- When answers arrive, resume the same task. If they change earlier assumptions, pause again with a new batch. Silence never settles a real choice.
- Real choices include new infrastructure patterns, ownership boundaries, shared lifecycles, new role directories or namespaces, and unresolved behavioral policy. Propose the smallest coherent prerequisite instead of a temporary bypass or a silently created framework.

<!-- @end -->

## Project and tools

- `@auaust/engrenage` is an ESM-only package of shared tooling configuration (ESLint, Prettier, TypeScript, Vite, agent instructions) for AUAUST projects. Read the actual source, configuration and package scripts for current details.
- Everything here runs in Node tooling: configs, build scripts and CLIs, never browser runtime code.
- Use pnpm and the scripts in `package.json`. TypeScript stays on the major supported by typescript-eslint.

## Project map

- Every directory in `src/` with an `index.ts` is a public entry `@auaust/engrenage/<name>`, discovered from the tsconfig `paths`. `src/index.ts` is the root entry.
- `src/types/` and `src/utils/` hold global types and helpers shared by several entries; the root entry exposes them. Anything not specific to one tool belongs there.
- Inside an entry, code lives in `builders/` (pure `create…` helpers: input and known data to output), `types/`, `utils/`, `constants.ts` (the domain's fixed internal values, such as option defaults and known file names) and `config/`.
- Schemas, defaults and constants stay pure JavaScript: they import only valibot, types and other schemas, defaults or constants, never `node:*`, which ESLint enforces. Filesystem access and other logic live in `builders/` and `utils/`.

## Modules and exports

- One function, constant or type per module, named after it, except `constants.ts`, which holds all of its domain's constants. Each type lives in its own file under `types/` and is re-exported by its entry's barrel; global types are exported only by the root entry.
- Internal imports use the `#<area>/…` subpath imports declared in `package.json`, barrels included. Never import an entry through its package name from inside `src/`.
- Name types after their tool's concept without a tool prefix (`Config`, `Rules`, `Conventions`). Use the global `Directory`, `File` and `Glob` for path-like values, adding `URL` to the union where a URL is accepted.
- Compose builder arguments from those types inline; never derive them by picking from a larger options type.
- Package exports are generated by tsdown from the entries and file exports. Run `pnpm build:tsdown` after adding an entry and commit the resulting `package.json`; never hand-edit `exports`.
- `@auaust/toolkit`, `@auaust/primitive-kit` and commander are devDependencies bundled into `dist`, so engrenage never depends on them at install time. `c12` and `valibot` are runtime dependencies, never bundled. Tool packages consumers configure (`eslint`, `prettier`, `typescript`, `vite`) are optional peer dependencies.

## Agent fragments

- `data/agents/sections/` holds shared AGENTS.md sections and `data/agents/rules/` shared `.claude/rules` files. They must stay project-agnostic: no paths, commands or tools specific to one repository.
- After changing a fragment, run `pnpm engrenage agents sync`, which also updates this repository's own copies.

<!-- @reference @auaust/engrenage/agents/sections/implementation.md -->

## Implementation

- Quality takes precedence over feature completion. A functional workaround that introduces architectural debt is not a completed feature.
- Before editing, inspect the execution path, authoritative definitions and available abstractions. Place code with its established owner and reuse its models, utilities, configuration and contracts rather than building parallel implementations.
- Judge quality by clear ownership, authoritative definitions, explicit contracts, predictable execution and state lifetime, readability and minimal necessary complexity. Neither fewer lines nor more abstractions is inherently better.
- Extend established extension points autonomously. Several small utilities or files must not disguise a missing abstraction.
- Derive behavior from authoritative configuration, definitions, metadata or live data. Do not invent hardcoded catalogues, lists, status flags or example data.
- Fail clearly on missing invariants. Use fallbacks only when they belong to the intended contract.
- Avoid code comments; prefer a named function or descriptive variable. Comment only essential intent or constraints.
- Delete obsolete starter code and commented-out implementations. Do not add READMEs for features or a `docs/` directory.
- When work would build on or deepen an architectural violation, correcting it is a prerequisite: stop under the decision protocol with what is required, what exists, the recommended fix and its scope. Correct existing violations you touch.
- Report relevant nearby inconsistencies without fixing them. Do not do unsolicited cleanup.
- `.claude/backlog.md` holds deferred work: architectural debt, upstream bugs and failing checks left unfixed. Add an entry when you report such an issue or the user defers work, under the matching numbered category. Point `N.M` is entry `M` of category `N`; remove resolved entries and renumber the rest.
- Keep secrets in `.env` (documented by `.env.example`), out of source, logs and runtime code.
- Propose missing or outdated skills, MCP servers, scripts, dependencies or abstractions when they would help. Never add, remove or upgrade them without the user's approval.

<!-- @reference @auaust/engrenage/agents/sections/typescript.md -->

## TypeScript

- Infer types from schemas, factories and API definitions instead of duplicating them. Preserve strict compiler settings and real optional contracts.
- Use interfaces for object shapes and type aliases for unions, functions and mapped types. Name types after the concept they carry. Never alias a mutable list (`Type[]`) under a new name; a read-only list (`readonly Type[]` or `ReadonlyArray<Type>`) may get one.
- Do not add `any`, casts, assertions, `@ts-*` directives or `eslint-disable` comments without a supported invariant. Disabled lint rules are not permission. Never add entries to `eslint-suppressions.json` unless explicitly requested.
- Validate data at external boundaries. Never hand-edit generated code, bundles or WebAssembly; change their sources and regenerate.

<!-- @reference @auaust/engrenage/agents/sections/auaust-libraries.md -->

## AUAUST libraries

- Reuse `@auaust/toolkit` and `@auaust/primitive-kit` instead of reimplementing their helpers; prefer toolkit when both provide one.
- Shared tooling configuration comes from `@auaust/engrenage`. Extend its builders and presets locally instead of copying or redefining them.

<!-- @end -->

## Code conventions

- Code style: `.claude/rules/code-style.md`.

<!-- @reference @auaust/engrenage/agents/sections/verification.md -->

## Verification

- Before delivery, review the work against architectural boundaries and quality requirements, not only behavior.
- Tests live under the root `tests/`, organized by the area they exercise. Write the minimum needed for confidence, usually one expected case and one meaningful edge case. Reuse existing tests before adding new ones.
- Format only changed files, never the whole repository.
- Report actual results and blockers, including unavailable integrations and skipped checks. Never weaken compiler or lint settings to hide failures.

<!-- @end -->

## Commands

- `pnpm lint` and `pnpm typecheck` for source changes; `pnpm test` runs tests in source mode and type checking.
- `pnpm build` for entries, exports, imports or bundling changes. It builds, validates packaging with publint and attw, and reruns the tests against `dist/`.
- `pnpm format <files>` on changed files only.
- `pnpm engrenage agents sync` after changing agent fragments; CI checks it with `--check`.
- `pnpm support codegen barrels [names…]` after adding, renaming or removing a module named by a barrel's `// @reference <directory>` block; CI checks it with `--check`.
- Add a changeset for any change that should be released.
