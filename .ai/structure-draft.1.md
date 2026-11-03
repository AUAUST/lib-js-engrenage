# Structure draft (plan #137)

Working draft for review. Not final: every point marked **Q** is an open question (batched in §10). Points marked **settled** were written into the issues as decided in this pass (correct them there if wrong).

## 1. Core idea

One model, four nouns, applied the same way in every project:

| Noun            | What it is                                                                                          | Declared where                                    | Example                                                 |
| --------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| **Environment** | A runtime context with its own directories and import rights                                        | config (exists today)                             | `src`, `bin`, `scripts`, `tests`, `data`, `tooling`     |
| **Tier**        | A grouping directory that owns no roles and fixes the import direction between the domains it holds | structure description, per environment            | `foundation/`, `project/`, `tools/`, `workflows/`       |
| **Domain**      | Any non-role directory, recursively; owns one concern; has one surface (`index.ts`)                 | implicit; metadata (visibility, purpose) declared | `tools/tsdown`, `tools/agents/claude`                   |
| **Role**        | A directory or file name with a fixed meaning and constraints, valid at any depth                   | role catalogue (preset + consumer roles)          | `utils/`, `types/`, `config/`, `setup/`, `constants.ts` |

- Everything else derives from these: lint boundaries (#150), agent guidance (#151), entry discovery (#154), lint/format scope, ownership in mixed codebases (§8).
- Tiers are the answer to "how to un-flatten": they are #141's grouping directories, given a direction. A tier is to engrenage what FSD layers are to an app and what `modules/` is to toolkit (one tier).
- "Root lists domains" (decided) still holds: tiers are domains that own no roles (#141).

## 2. Environments: graph, imports, exposure

```
                  ┌──────────────────────────────────────────────┐
                  │ tooling: engrenage.config.ts, eslint.config, │
                  │ tsdown.config, vitest.config …               │
                  └──────────────────────┬───────────────────────┘
                                         │ public entries only
                                         ▼
  bin ─────────── imports ───────▶ ┌───────────┐ ── reads at runtime ──▶ data
  scripts ─────── imports ───────▶ │    src    │                          ▲
  tests ───────── imports ───────▶ └───────────┘                          │
    │                                    ▲                                │
    ├── spawns ──▶ bin                   │ writes generated files         │
    ├── imports ─▶ scripts         scripts ─────────────────────────────▶─┘
    └── reads ───▶ tests/fixtures
```

| from ↓ / to → | `src` public   | `src` internal (`#…`)                                     | `bin`                 | `scripts` | `tests`                       | `data`                            |
| ------------- | -------------- | --------------------------------------------------------- | --------------------- | --------- | ----------------------------- | --------------------------------- |
| `src`         | own rules (§4) | own rules (§4)                                            | never                 | never     | never                         | read through the data domain only |
| `bin`         | yes            | yes                                                       | own command tree only | never     | never                         | never directly                    |
| `scripts`     | yes            | yes                                                       | never                 | own       | never                         | read/write (generated files)      |
| `tests`       | yes            | per-project policy (settled: declared in the description) | spawn only            | yes       | own (`helpers/`, `fixtures/`) | read                              |
| `tooling`     | yes            | never                                                     | never                 | never     | never                         | never                             |
| `data`        | not code       |                                                           |                       |           |                               |                                   |

| Environment | Exposes                                                                           | Contents                                                                          |
| ----------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src`       | public entries (declared visibility, `src.exports`); `#` subpaths inside the repo | tiers → domains → roles                                                           |
| `bin`       | executables (`package.json#bin`)                                                  | discovered command files; thin: parse, then call a workflow                       |
| `scripts`   | nothing (run by package scripts)                                                  | generators with their inputs beside them (#147), maintenance scripts              |
| `tests`     | nothing                                                                           | mirrors `src` tiers/domains; roles `helpers/`, `fixtures/`; discovered `setup.ts` |
| `data`      | published files (`data.exports`)                                                  | one directory per owning domain; read only by that domain                         |
| `tooling`   | config files consumed by tools                                                    | root config files; dogfoods public entries                                        |

## 3. Proposed `src/` (engrenage)

```
src/
├─ index.ts                root entry; re-exports global types/utils barrels
├─ constants.ts
├─ types/                  global types (Directory, File, Glob, PackageName, SyncResult…)
├─ utils/                  global pure helpers (filesIn and syncFiles move out: impure; verify syncBlocks)
│
├─ foundation/             engrenage's own infrastructure; knows nothing of the project config
│  ├─ filesystem/          staged filesystem, virtual files (file-editing.1), filesIn
│  ├─ processes/           spawn wrappers (debt.2)
│  ├─ data/                data-file access, ESM-aware (#9, debt.4)
│  ├─ json/                JSON read/write
│  ├─ blocks/              marker blocks and sync primitives: syncBlocks, syncFiles, syncIgnoreFile (#9)
│  └─ options/             declaration helper over valibot (#146), validate
│
├─ project/                the project model: tool-agnostic models, contracts, config loading
│  ├─ config/              raw loading (c12), root (#56), lazy sections, global settings, loadConfig(root)
│  ├─ structure/           project structure description (#148)
│  ├─ environments/        environment model; composes the sub-configs below per environment
│  ├─ presets/             preset list and schema (effects live in each declaration as computed defaults)
│  ├─ package/             package.json model, exports/imports sub-config, canonical order (was support/packageJson)
│  ├─ tsconfig/            tsconfig model, environment tsconfig sub-config, key order (typescript.7)
│  ├─ baseline/            runtime and baseline: Node runtime, ES editions (generated editions data)
│  ├─ build/               build contract: entries, output, target, formats, clean policy
│  └─ formatting/          formatting contract: formatContent / formatFile signature (#154)
│
├─ tools/                  one domain per external tool: owns its options, files, adapters
│  ├─ typescript/          lib selection, API declarations, tsc
│  ├─ eslint/              config, plugin, conventions/, debt markers
│  ├─ prettier/            config; implements project/formatting
│  ├─ pnpm/                manifest, installs, upgrades
│  ├─ tsdown/              definer; implements project/build
│  ├─ vite/                definer; implements project/build
│  ├─ vitest/              definer (builds on vite)
│  ├─ changesets/  git/  github/  vscode/
│  └─ agents/              claude/, codex/ (public sub-domains)
│
└─ workflows/              composition: wires tools to contracts, runs across domains
   ├─ registry/            full registry: every section, eager validation, composed Config type
   ├─ init/                collects and orders every domain's init steps
   ├─ sync/                collects every domain's sync targets; injects the formatter
   └─ cli/                 commander and scaffold plumbing for bin (was support/commander, support/scaffold)
```

Root: 4 tiers + 2 global roots + 2 files, instead of 17 entries today and 30+ after splitting `support`, `config` and `typescript` flat.

### Tier directions

| from ↓ / to → | global roots | `foundation`            | `project`               | `tools`                                 | `workflows`             |
| ------------- | ------------ | ----------------------- | ----------------------- | --------------------------------------- | ----------------------- |
| `foundation`  | ✓            | siblings via `index.ts` | ✗                       | ✗                                       | ✗                       |
| `project`     | ✓            | ✓                       | siblings via `index.ts` | ✗                                       | ✗                       |
| `tools`       | ✓            | ✓                       | ✓                       | siblings via `index.ts` (vitest → vite) | ✗                       |
| `workflows`   | ✓            | ✓                       | ✓                       | ✓                                       | siblings via `index.ts` |

- Cycles between siblings fail. Global roots import only each other (decided).
- Public entry paths decouple from directories: `src.exports` already maps them by hand (`"./*": "src/*/index.ts"`), so `@auaust/engrenage/tsdown` can point at `src/tools/tsdown/index.ts`. Visibility (#154, settled): `foundation` and `workflows` internal; `project` partly public (`config`, `package`, `baseline`, `formatting`); `tools` public.

### Answers to the scratchpad questions

- **"Do we split the config toolkit from engrenage's config?"** Yes: `foundation/options` is generic declaration machinery (no project knowledge, reusable by every tool's declaration and by consumers); `project/config` is engrenage's project config built with it.
- **"How do tools reuse it for their own options and definer?"** Each tool's `config/` role declares its section with `foundation/options`. A definer = load raw input (`project/config`) → resolve its own section → read lower sections (global settings, baseline, tsconfig) through the lazy `get` (#143, settled).
- **"Is tsconfig a tool or a sub-domain of typescript?"** A project model. Environments compose a tsconfig sub-config, so it must sit below every tool; `tools/typescript` consumes it like ESLint, tsdown and Vitest do. Same reasoning for `package` and `baseline`.
- **"ESLint, Prettier and pnpm are required, tsdown and Vitest are not: 'tool' is insufficient."** Requiredness is a dependency fact (regular dependency versus optional peer), not a tier. What it changes structurally: nothing below `tools` may import a tool. When engrenage's own operations need a tool capability (format on write, install, lint), either a contract exists in `project` (formatting: toolkit needs it without knowing Prettier, so it passes the contract criterion) and `workflows` injects the implementation, or the operation is itself composition and lives in `workflows`. tsdown and Vitest differ only in who calls them (the consumer's config file, not the CLI). **Q7.**

## 4. Inside a domain

```
tools/tsdown/
├─ index.ts           public surface (only file outsiders import)
├─ constants.ts       deeply read-only domain constants
├─ config/            declaration of the domain's options (pure, via foundation/options)
├─ <operations>/      impure domain logic: resolvers, readers, producers   (name: Q5)
├─ setup/             init steps and sync targets
├─ plugins/           the tool's own plugins
├─ utils/             pure, contained functions
├─ types/             types only
├─ internals/         implementation details, never exposed, never a dump
└─ <sub-domain>/      same rules, recursively; private unless declared public
```

Role-level directions inside a domain (from #142 and #150):

| Role         | May import                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `types/`     | `types/` here and above                                                                                  |
| `utils/`     | neighbouring `utils/`, `types/` here and above; never another domain's `utils/`, never another role here |
| `config/`    | `foundation/options`, lower-tier surfaces, `types/`, `utils/`, `constants.ts`                            |
| `internals/` | anything the domain may import; imported only from inside the domain                                     |
| other roles  | anything the domain's tier allows                                                                        |

## 5. Role catalogue (first list)

| Role            | Env                 | Holds                                 | File constraints                                          | Status                              |
| --------------- | ------------------- | ------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| `index.ts`      | all code envs       | domain surface                        | no local values except a SCREAMING_CASE metadata constant | decided                             |
| `constants.ts`  | all code envs       | deeply read-only constants            | type-aware read-only check                                | decided                             |
| `types/`        | src, tests, scripts | types only                            | single export, name match, no local declarations          | decided                             |
| `utils/`        | src, scripts        | pure contained logic                  | single export, name match                                 | decided                             |
| `internals/`    | src                 | domain implementation details         | single export, name match; never re-exported              | decided                             |
| `config/`       | src                 | option declaration (#146)             | single export, name match, no local declarations          | decided                             |
| `contracts/`    | src                 | interfaces another domain implements  | types and declarations only                               | candidate                           |
| `<operations>/` | src                 | impure domain logic                   | single export, name match                                 | **Q5**                              |
| `setup/`        | src                 | init steps, sync targets              | single export, name match; verbs `create…Step`, `sync…`   | settled                             |
| `plugins/`      | src                 | the tool's plugins, one per module    | default export allowed if discovered                      | decided                             |
| `conventions/`  | src (eslint)        | ESLint conventions                    | discovered files                                          | existing, consumer-style role       |
| `errors/`       | src                 | error classes                         | single export, name match                                 | candidate (toolkit has it)          |
| `definers/`     | src                 | `define…Config` functions             | single export                                             | candidate, depends on Q3            |
| `adapters/`     | src                 | a tool's implementation of a contract | single export                                             | candidate; may fold into operations |
| `helpers/`      | tests               | shared test helpers, one per module   | single export, name match                                 | existing                            |
| `fixtures/`     | tests               | fixture projects and files            | none (not code)                                           | existing                            |
| `inputs/`       | scripts             | hand-maintained generator inputs      | constants only                                            | candidate (#147)                    |

Look-ahead, roles other projects will need (consumer roles or presets, not engrenage's catalogue):

| Need                 | Role candidates                                                                       | Notes                                                          |
| -------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| UI apps              | `components/`, `composables/` / `hooks/`, `stores/`, `pages/` / `routes/`, `layouts/` | framework presets; some are framework-owned (§9)               |
| Ambient declarations | `declarations/` (`env.d.ts`, `vite-env.d.ts`, shims)                                  | `types/` holds exported types; ambient files have no exports   |
| Assets beside code   | `styles/`, `assets/`, `icons/`                                                        | not code: no TS constraints; language-scoped (configuration.1) |
| i18n                 | `locales/`                                                                            | data, not code                                                 |
| Workers, server code | `workers/`, `server/`                                                                 | often a separate environment rather than a role                |
| Validation           | `schemas/`                                                                            | today `config/schemas`; app-side valibot/zod schemas           |
| Mocks                | `mocks/` (tests)                                                                      |                                                                |

## 6. `bin`, `scripts`, `tests`, `data`

```
bin/engrenage/                 discovered commands; tree = command tree; no roles
├─ index.ts  init.ts  sync.ts  debt.ts  eslint.ts  tsdown.ts  vite.ts  vitest.ts  tsc.ts  prettier.ts
├─ pnpm/{index,upgrade}.ts
└─ agents/{index,rules,skills}.ts, claude/…, codex/…
   (shared CLI code lives in src/workflows/cli, not in bin: Q6)

scripts/
├─ codegen/                    one generator per domain it writes into (#147)
│  ├─ editions.ts              → src/project/baseline/…   inputs (esMemberCompatKeys…) beside it
│  ├─ apis.ts                  → data/apis/*.d.ts
│  ├─ rules.ts                 → src/tools/eslint/types/Rules.ts, types/rules/**
│  ├─ config.ts                → each domain's input type + composed Config (workflows/registry)
│  └─ barrels.ts               → @barrel blocks (#51)
└─ pnpm.ts

tests/
├─ setup.ts                    discovered
├─ helpers/  fixtures/         roles
├─ foundation/<domain>/…       mirrors src tiers and domains
├─ project/<domain>/…
├─ tools/<domain>/…
├─ workflows/<domain>/…
├─ bin/…   scripts/…           tests of the other environments

data/                          one directory per owning src domain
├─ agents/{rules,sections,skills,templates}   owner tools/agents
├─ apis/                                       owner tools/typescript (generated)
├─ github/workflows/                           owner tools/github
└─ tsconfig/                                   owner project/tsconfig
```

## 7. Config pipeline under tiers (proposal for #143, Q3)

```
foundation/options      declare(), flags, computed defaults           (no project knowledge)
        ▲
project/config          load raw input once per root (c12), memoized
                        resolves project sections lazily: globals, structure, environments,
                        presets, package, tsconfig, baseline, build      get(section)
        ▲
tools/<tool>/config     declares its section; resolved on demand with get() for lower sections
tools/<tool>/definer    defineTsdownConfig() = raw → own section + get('build','baseline',…)
        ▲
workflows/registry      every section, eager validation (CLI, --check), composed Config type,
                        loadConfig(root) with tool sections
```

No module imports upward, so the registry needs no role-level exception to the tier rule (#143 option (a) needed one). Public `loadConfig(root)` from `project/config` covers toolkit's need (structure, settings); the full one sits in `workflows/registry`.

## 8. Living inside a mixed codebase (Shopify theme, Laravel, Kirby)

Principle: **default-deny ownership.** Engrenage acts only on what it declares; everything else is foreign and untouched. It never models Shopify, Laravel or Kirby; it only avoids their paths.

| Category           | Examples                                                                                           | Engrenage may                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Owned directories  | declared environment `dirs`                                                                        | lint, format, check structure, create and rewrite files                      |
| Owned files        | `engrenage.config.ts`, generated tsconfigs, its config files                                       | create and rewrite                                                           |
| Shared files       | `package.json`, `.gitignore`, `.prettierignore`, `.vscode/settings.json`, `AGENTS.md`, `CLAUDE.md` | managed keys or marker blocks only; never remove foreign content             |
| Output directories | `dist/`, Shopify `assets/`, Laravel `public/build/`                                                | write emitted files; clean only what it emitted unless it owns the directory |
| Foreign            | everything else                                                                                    | nothing: not linted, formatted, scanned for structure, deleted or rewritten  |

```
shopify-theme/                              laravel-app/
├─ assets/        output (shared!)          ├─ app/ config/ routes/ database/ vendor/   foreign
├─ config/        foreign (role-named!)     ├─ resources/js/        src environment
├─ layout/ sections/ snippets/              ├─ resources/views/     foreign (Blade)
│  templates/ blocks/ locales/  foreign     ├─ public/build/        output (owned dir)
├─ src/           src environment           ├─ tests/               foreign (PHP) → JS tests elsewhere
├─ tests/         tests environment         ├─ package.json         shared
├─ package.json   shared                    ├─ composer.json        foreign
└─ engrenage.config.ts                      └─ engrenage.config.ts
```

Concrete requirements this produces:

1. Roles and domains apply only inside declared environment dirs. Shopify's root `config/` and Laravel's `config/` are never the `config` role.
2. Environment defaults (`tests/`, `scripts/`, `bin/`, `data/`) collide with host directories (Laravel `tests/` is PHP). An "embedded" mode or preset sets no default dirs; every environment is explicit.
3. Every derived scope (ESLint files, Prettier command globs, ignore blocks, structure lint) comes from the declared environments, never `**` (#148 derived scope, settled).
4. Build contract carries a clean policy: `emitted` (manifest of what the build wrote) for shared output dirs like Shopify `assets/`, `all` only for owned dirs. Otherwise a tsdown/Vite clean wipes hand-placed assets.
5. Project root versus repository root (#56): a Kirby plugin or a theme in a sub-directory has `.git/` and `.github/` higher up. Git and GitHub domains resolve the repository root separately.
6. Shared instruction files: Laravel Boost and similar tools also write `AGENTS.md`/`CLAUDE.md`. Engrenage keeps to its marker blocks and scopes its rules to its environment dirs (rule `paths` frontmatter).
7. GitHub workflows namespaced (`engrenage-*.yml` or a configurable prefix) so they never collide with host CI.
8. pnpm is assumed today; Laravel, Kirby and Shopify starters ship npm lockfiles. Requiring pnpm limits adoption. **Q8.**

## 9. Where the model could be limiting, and mitigations

| Risk                                                                                                                   | Mitigation                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing codebase names a role differently (`helpers/`, `lib/`)                                                        | role aliases: a directory name maps to a role profile (**Q10**)                                                                                          |
| A host or framework directory is named like a role (`components/` with other semantics)                                | opt-out per directory (decided, #141)                                                                                                                    |
| Framework-owned file conventions (SvelteKit `+page.ts`, Nuxt `pages/`, Next `app/`) break single-export and name-match | "framework-owned" globs, generalizing `discovered`: no naming or export constraints                                                                      |
| Single export / name match on non-TS files (Vue SFC, CSS, Liquid)                                                      | file constraints are language-scoped: TS/JS only                                                                                                         |
| Legacy code that cannot comply at once                                                                                 | strictness per environment: `strict` (every directory classified) or `loose` (unclassified directories are plain domains, only recognized roles checked) |
| Tests colocated with code in apps                                                                                      | tests placement is a description policy (`root` or `colocated`), replacing the fixed `noMisplacedTests` assumption (**Q12**)                             |
| App layers (FSD)                                                                                                       | tiers are the same mechanism: an app preset declares `app/pages/features/entities/shared`                                                                |
| Monorepos                                                                                                              | one description per package; no cross-package rules (out of scope)                                                                                       |
| Deep public paths                                                                                                      | exports decoupled from directories (exists)                                                                                                              |

## 10. Open questions

| #   | Question                                               | Options                                                                                                                                                                                                    | Recommendation                                                                                                                                                              | Issue      |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Q1  | How to un-flatten `src/`                               | (a) tiers as directories (`foundation`, `project`, `tools`, `workflows`); (b) one `domains/` wrapper (toolkit's `modules/`): separates global roots but stays flat inside; (c) flat root, kind as metadata | (a): the root becomes navigable, the direction is visible in the path, lint is path-based. Names open (`workflows` vs `app` vs `orchestration`; `foundation` vs `platform`) | #139       |
| Q2  | Subpath imports                                        | (a) per tier (`#tools/*`, `#project/*`): 6 aliases, derived from paths; (b) per domain (`#tsdown/*`): 20+ aliases, shorter imports                                                                         | (a)                                                                                                                                                                         | #139       |
| Q3  | Registry placement                                     | (a) role-level exception: registry in the config layer imports every domain's `config/`; (d) tiered: `project/config` resolves project sections, each tool resolves its own, full registry in `workflows`  | (d): acyclic without exceptions (§7)                                                                                                                                        | #143       |
| Q4  | Tool options in the project config or only in definers | (a) definer-only for ESLint, tsdown, Vite, Vitest; (b) every tool has a section, definer options override                                                                                                  | still open; (d) makes (b) cheap, since `workflows/registry` may import every tool                                                                                           | #153       |
| Q5  | Home and name of impure domain logic                   | `operations/`, `services/`, one role per kind                                                                                                                                                              | one role, fixed verb per kind; name to choose                                                                                                                               | #142       |
| Q6  | Where CLI plumbing lives                               | (a) `src/workflows/cli`; (b) roles inside `bin/`                                                                                                                                                           | (a): bin stays a discovered command tree                                                                                                                                    | #139       |
| Q7  | "Required" tools                                       | (a) dependency metadata, structure unchanged, capabilities via contracts injected by `workflows`; (b) a separate tier for tools engrenage itself needs                                                     | (a)                                                                                                                                                                         | #139       |
| Q8  | Mixed codebases                                        | default-deny ownership, explicit dirs mode, clean policy, repository root; pnpm requirement kept or a package-manager contract                                                                             | adopt the ownership model; keep pnpm until a project needs npm                                                                                                              | #148, #153 |
| Q9  | Description placement                                  | role catalogue top-level; each environment selects roles and declares its tiers and domains                                                                                                                | this (refines #148 option (c): tests and scripts have their own roles)                                                                                                      | #148       |
| Q10 | Role aliases (directory name ≠ role)                   | yes / no                                                                                                                                                                                                   | yes, for adoption in existing codebases                                                                                                                                     | #148       |
| Q11 | Preset scope                                           | environment presets only; plus project-kind presets (Shopify theme adds an environment and changes output)                                                                                                 | the theme case argues for project-kind presets; still open                                                                                                                  | #153       |
| Q12 | Tests placement policy                                 | fixed root `tests/`; declared `root` or `colocated`                                                                                                                                                        | declared, default `root`                                                                                                                                                    | #148       |

## 11. Settled in this pass (written into the issues)

- #139: contract only with two engines or a consumer needing the intent without the engine; formatting passes the second clause.
- #141: sub-domains implicit (any non-role directory), top-level declared; private by default, public when declared; siblings import through `index.ts`, cycles fail; grouping directories never have an `index.ts`.
- #142: `internals/` holds only domain-serving code that fits no other role, never imported from outside or re-exported; `setup/` keeps steps and targets, producers move to the impure-logic role; file constraints: single export and name match everywhere except `constants.ts`/`index.ts`, "no local declarations" only in `types/` and `config/`.
- #143: cross-section reads through a lazy `get(section)`, cycles fail with their path; environment sub-configs exported by their domain and composed automatically; memoized per section and root.
- #146: context = any section via `get`; callbacks may only narrow a base schema; input types generated per domain, composed `Config` generated at the registry; flags `optional` and `disable` first; the helper imports no domain.
- #148: global roots declared, presets give defaults; tests import policy per project; derived scopes from the description.
- #150: consumers extend the description; a `boundaries` option is the escape hatch; existing violations fixed by migration before the rule lands.
- #151: domains and roles both generated; a generated rule file loaded at start, checked by `--check`; the placement axiom moves to #152.
- #153: one breaking release; root, debug, cache, module type and versions global; `define` → environment sub-config; `build` → `build` contract section; imports/exports → package sub-config.
- #154: visibility declared in the description, internal domains keep `index.ts` but no export; public = a named need from another AUAUST library; `formatContent` plus `formatFile` built on it.
