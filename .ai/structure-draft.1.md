# Structure draft 1: resolved state (plan #137)

The settled structure, as written into #137 and its sub-issues. The points still open are in `structure-draft.2.md`.

## 1. Core model

| Noun            | What it is                                                                                                                                  | Declared where                                    | Example                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| **Environment** | A runtime context with its own directories and import rights                                                                                | config (exists today)                             | `src`, `bin`, `scripts`, `tests`, `data`, `tooling`     |
| **Namespace**   | A grouping directory: no `index.ts`, no roles, no concern; holds domains and namespaces; carries the **layers** of its children as metadata | structure description, or a preset                | `foundation/`, `project/`, `tools/`, `workflows/`       |
| **Layer**       | Ordering metadata of a namespace's children, lowest first, `*` for every child not listed                                                   | the namespace's `layers`                          | `["support", "*", "ui"]`                                |
| **Domain**      | Any directory that is neither a role nor a namespace, recursively; owns one concern; has one surface (`index.ts`)                           | implicit; metadata (visibility, purpose) declared | `tools/tsdown`, `tools/agents/claude`                   |
| **Role**        | A directory or file name with a fixed meaning and a contract, valid at any depth                                                            | role catalogue (defaults, presets, project)       | `utils/`, `types/`, `errors/`, `constants.ts`, `*.d.ts` |

- Everything derives from these: lint boundaries, agent guidance, the structure report, entry discovery, aliases, lint and format scope.
- Classification has three layers, highest priority first: the project's configuration, preset defaults, inference from the filesystem. Every default is configurable; whatever is not declared is inferred.
- Filesystem cues for inference: a domain always has `index.ts`, a namespace never does, a role is a known role name.

### Namespaces and layers

- A namespace groups; layers order. A namespace may declare no layers; layers may rank namespaces and domains alike.
- The environment root is a namespace for layers, while also holding the environment's global roles and, in a library, the root entry `index.ts`. Conceptually the project root is one too: its order is the environment import table (§2).
- A child imports global roles, lower layers and the peers of its own layer (through their `index.ts`); never a higher layer. All domains of one layer are peers.
- Children of a namespace without `layers` are unordered peers.
- Undeclared layers are never inferred from imports: they come from the description or from a preset's convention.
- Namespaces and layers are allowed at any depth (`<domain>/resources/<sub-domain>`). A domain does not order its sub-domains; a namespace is inserted for that.
- Cycles are not checked by any tool: layers and surfaces prevent them.

### Telling roles apart

- Roles form a short, known vocabulary: the defaults plus what presets and the project enable or define. No plural convention, no sigil.
- A role directory holding an `index` its contract does not allow fails lint, which catches a role name used for a domain. Empty directories are ignored.
- `engrenage structure` reports every directory it cannot classify.
- A domain named like a role opts out of role detection. Children of a namespace are never roles, so `project/config` needs no opt-out.

## 2. Environments

```
                  ┌──────────────────────────────────────────────┐
                  │ tooling: root config files + tooling/        │
                  └──────────────────────┬───────────────────────┘
                                         │ public entries (library) / declared domain surfaces (app)
                                         ▼
  bin ─────────── imports ───────▶ ┌───────────┐ ── library: reads at runtime ──▶ data
  scripts ─────── imports ───────▶ │    src    │    through the public specifier
  tests ───────── imports ───────▶ └───────────┘ ── app: imports through #data ──▶ data
    │                                    ▲                                        ▲
    ├── spawns ──▶ bin (source mode) or the built executable (dist mode)          │
    ├── imports ─▶ scripts         scripts ── writes generated files ─────────────┘
    └── reads ───▶ tests/fixtures
```

| from ↓ / to → | `src` public                             | `src` internal (`#…`)                      | `bin`                 | `scripts` | `tests` | `data`                                                  |
| ------------- | ---------------------------------------- | ------------------------------------------ | --------------------- | --------- | ------- | ------------------------------------------------------- |
| `src`         | own rules (§3)                           | own rules (§3)                             | never                 | never     | never   | library: runtime, public specifier only; app: `#data/…` |
| `bin`         | yes                                      | yes                                        | own command tree only | never     | never   | never directly                                          |
| `scripts`     | yes                                      | yes                                        | never                 | own       | never   | read/write by path (generated files)                    |
| `tests`       | library: package name only (`x.test.ts`) | library: `x.test.src.ts` only; app: always | spawn only            | yes       | own     | library: public specifier; app: `#data/…`               |
| `tooling`     | library: public entries only             | app: declared domain surfaces              | never                 | never     | never   | never                                                   |

| Environment | Exposes                                                                          | Contents                                                                               |
| ----------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src`       | public entries (declared visibility, `src.exports`); `#` aliases inside the repo | namespaces → domains → roles                                                           |
| `bin`       | executables (`package.json#bin`)                                                 | discovered command files; thin: parse input, call a domain capability; no roles        |
| `scripts`   | nothing (run by package scripts)                                                 | generators with their inputs beside them, maintenance scripts                          |
| `tests`     | nothing                                                                          | tests mirroring the tested environment's layout; its own roles                         |
| `data`      | library: published files (`data.exports`); app: modules imported through `#data` | no roles, no structure lint                                                            |
| `tooling`   | config files consumed by tools                                                   | root config files plus `tooling/`: same roles as `src`, no layers, one domain per tool |

### Library versus app

The difference is the **published** trait, which the `library` preset resolves to. Rules read the trait, never the preset name.

| Concern            | Library (published)                                            | App                                        |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------ |
| Dist testing       | source and dist modes, test variants, import constraints       | none: no dist mode, no tests dist tsconfig |
| Tests import `src` | `x.test.ts` by package name; `x.test.src.ts` by `#…`           | by `#…` aliases                            |
| `src` → `data`     | runtime only, through the public specifier (`foundation/data`) | static imports through `#data/…`           |
| `#data` alias      | never                                                          | on by default                              |
| `tooling` → `src`  | public entries only                                            | declared domain surfaces                   |

### Tests (libraries)

| File             | Runs in          | Imports                                                       |
| ---------------- | ---------------- | ------------------------------------------------------------- |
| `x.test.ts`      | source and dist  | public specifiers (`@auaust/engrenage/…`) and `#tests/…` only |
| `x.test.src.ts`  | source mode only | internals through `#…`; never the package name                |
| `x.test.dist.ts` | dist mode only   | public specifiers only; may reach dist-only artefacts         |

- Test files are matched from three configurable parts: a location glob (`**/*`), a suffix glob (`.{spec,test}`) and an extension glob (`.{ts,tsx}`). Engrenage combines them into the plain pattern and the variant patterns (location + suffix + `.src` or `.dist` + extension). Vitest's default ignores the variants (verified on 5.0.5); the variant must follow the suffix, since `x.dist.test.ts` would run in both modes.
- Source mode: public specifiers map to `src/` through tsconfig `paths` generated from `src.exports`; any resolution into the build output fails (`createOutDirGuard`).
- Dist mode: public specifiers resolve through `exports` to the build output; a plugin fails on any resolution into `src/`; no tsconfig `paths` or bundler alias resolves.
- The executable is spawned per mode: its source entry in source mode, the built file from `package.json#bin` in dist mode.
- Tests mirror the tested environment's layout; all variants of one file's tests sit side by side.

### Data

- Libraries: `src/` reaches `data/` only at runtime through the package's public specifier, by `foundation/data`, so source and dist modes read the same file.
- Apps: `src/` imports `data/` statically through `#data/…`.
- `data/` has no roles; a library's `data.exports` defines its layout.

### Tooling

Project tool configuration code lives in `tooling/`, imported by root config files through `#tooling/…`; never in `scripts/`, `src/` or a root `config/`.

## 3. `src/` of engrenage

```
src/                       layers: foundation < project < tools < workflows
├─ index.ts  constants.ts  types/  utils/        global roles; utils stay pure
├─ foundation/             infrastructure without project knowledge
│  ├─ filesystem/          staged filesystem, virtual files, filesIn
│  ├─ processes/           spawn wrappers
│  ├─ data/                runtime data access through the public specifier
│  ├─ json/                JSON read/write
│  ├─ blocks/              marker blocks and sync primitives: syncBlocks, syncFiles, syncIgnoreFile
│  └─ options/             declaration helper over valibot, validate
├─ project/                tool-agnostic models, contracts, config loading
│  ├─ config/  structure/  environments/  presets/  package/  tsconfig/  baseline/
│  ├─ build/               build contract: ports, entries, output, target, formats, clean policy
│  └─ formatting/          formatting contract: ports, formatContent / formatFile
├─ tools/                  one domain per external tool, holding its adapters
│  ├─ typescript/  eslint/  prettier/  pnpm/  tsdown/  vite/  vitest/
│  ├─ changesets/  git/  github/  vscode/
│  └─ agents/              claude/, codex/ (public sub-domains)
└─ workflows/              composition: registry/, init/, sync/, cli/
```

| from ↓ / to → | global roles | `foundation` | `project` | `tools`               | `workflows` |
| ------------- | ------------ | ------------ | --------- | --------------------- | ----------- |
| `foundation`  | ✓            | peers        | ✗         | ✗                     | ✗           |
| `project`     | ✓            | ✓            | peers     | ✗                     | ✗           |
| `tools`       | ✓            | ✓            | ✓         | peers (vitest → vite) | ✗           |
| `workflows`   | ✓            | ✓            | ✓         | ✓                     | peers       |

- "Peers" import each other's `index.ts` (`foundation/blocks` → `foundation/filesystem/index.ts`). Global roles import only each other.
- Public roles (§5) are the one exception to "through `index.ts`".
- Public entry paths decouple from directories through `src.exports` (`@auaust/engrenage/tsdown` → `src/tools/tsdown/index.ts`).
- Visibility: everything internal unless declared public. `foundation` and `workflows` internal; `project` public for `config`, `package`, `baseline`, `formatting`; `tools` public.

### Placement

- `foundation/options` is the generic declaration machinery; `project/config` loads engrenage's configuration with it.
- Each domain's `config/` declares its section; its definer, in `operations/`, loads raw input through `project/config`, resolves its own section and reads lower sections through the lazy `get`.
- Tsconfig model, package layout and baseline are project models below every tool; `tools/typescript` consumes the tsconfig model like ESLint, tsdown and Vitest.
- Contract domains hold their interfaces in `ports/`; tool domains implement them in `adapters/`; `workflows` injects adapters into ports.
- A domain owns the logic of its capabilities; `workflows/cli` turns them into commands; `bin/` stays a discovered tree of thin commands.
- Tools engrenage needs itself (ESLint, Prettier, pnpm) get no namespace: requiredness is dependency metadata, and a capability engrenage needs goes through a port that `workflows` fills.
- A concern gets a contract domain only when two or more engines exist or a consumer needs the intent without the engine: `build` and `formatting` qualify; lint, typecheck and install do not.

## 4. Inside a domain

```
tools/tsdown/
├─ index.ts           public surface
├─ constants.ts       deeply read-only domain constants, including hard-coded data
├─ config/            declaration of the domain's options (engrenage-defined role)
├─ setup/             init steps and sync targets (engrenage-defined role)
├─ plugins/           the tool's own plugins (engrenage-defined role)
├─ operations/        impure logic and definers (engrenage-defined role)
├─ adapters/          implementations of other domains' ports (public)
├─ utils/             pure, contained functions
├─ types/             types only
└─ <sub-domain>/      same rules, recursively; private unless declared public
```

| Role        | May import                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `types/`    | `types/` here and above                                                                                  |
| `utils/`    | neighbouring `utils/`, `types/` here and above; never another domain's `utils/`, never another role here |
| `config/`   | `foundation/options`, lower-layer surfaces, `types/`, `utils/`, `constants.ts`                           |
| other roles | anything the domain's layer allows                                                                       |

- A domain contains only roles (directory or file roles), sub-domains and namespaces.
- The home of impure logic is the project's choice. Engrenage defines one role for it, `operations/`, measured as enough for its volume.
- One verb per module kind: `create…Step` for init steps, `sync…` only for sync targets, `generate…` for generators, `define…Config` for definers.

## 5. Roles

### Catalogue

A role is on by default when the name never serves another purpose, conflicts with no other role and means the same in every environment.

| Role           | Kind      | Default | Public | Holds                                                     | Contract                                                  |
| -------------- | --------- | ------- | ------ | --------------------------------------------------------- | --------------------------------------------------------- |
| `index.ts`     | file      | yes     | —      | domain surface                                            | no local values except a SCREAMING_CASE metadata constant |
| `constants.ts` | file      | yes     | no     | deeply read-only constants, enums as const objects        | type-aware read-only check                                |
| `*.d.ts`       | file      | yes     | no     | ambient declarations                                      | none                                                      |
| `types/`       | directory | yes     | no     | types only                                                | single export, name match, no local declarations          |
| `utils/`       | directory | yes     | no     | `src`: pure contained logic; `tests`: shared test helpers | single export, name match                                 |
| `errors/`      | directory | yes     | yes    | error classes callers catch                               | single export, name match                                 |
| `enums/`       | directory | yes     | no     | enums, for domains declaring many                         | single export, name match                                 |
| `ports/`       | directory | yes     | yes    | one contract type per file                                | single type export, name match                            |
| `adapters/`    | directory | yes     | yes    | implementations of ports                                  | single export, name match                                 |
| `fixtures/`    | directory | tests   | —      | fixture projects and files                                | none                                                      |
| `setup.ts`     | file      | tests   | —      | test setup, discovered by Vitest                          | discovered                                                |

- Shipped but off by default, enabled by the presets that use them: `schemas/`, `components/`, `hooks/`, `contexts/`, `pages/` (discovered), `styles/`. The catalogue grows when a preset needs a role.
- Engrenage defines `config/`, `setup/`, `plugins/` and `operations/` in its own `engrenage.config.ts`.
- A port is exactly one type (type alias or interface), named after its file; it may re-export another type. A port composed of other types keeps them in `types/`; consumers in other domains import them through the domain's `index.ts`.
- `bin` has no roles. `data` has no roles.
- No `internals/`, `helpers/`, `classes/` or `data/` role by default; a project may define any of them. An error class goes to `errors/`, a stateful service to the project's impure-logic role, a value object with the types or utils it serves.
- Hard-coded app data belongs in the domain's `constants.ts`.
- A file that fits no role reveals a missing role or domain; `engrenage structure` reports it.

### Configuration

```ts
roles: {
  enable: ["schemas"],      // known keys, type-safe
  disable: ["enums"],       // known keys, type-safe
  define: { operations: { exports: "named-match" } },
}
```

- `enable` and `disable` apply to the defaults first; `define` applies after them and may redefine a role.
- `roles` exists at the top level (project catalogue) and in each environment (refining its set), top level first.
- Role aliases map an existing directory name to a role's contract (`helpers` read as `utils`).
- The role system can be turned off entirely: no role or boundary rules are generated, no role checks run, any layout is accepted, and the rest of engrenage works unchanged.
- `engrenage init` has a minimal role step: it defines one example role (the project's impure-logic role), showing how roles are declared.

### Contracts

| Field        | Meaning                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`       | makes the role a file role, matched by a string or list of strings, globs included (`"constants.ts"`, `["*.d.ts"]`)                                  |
| `accepts`    | files a directory role takes, strings or globs (`["*.tsx", "*.css"]`)                                                                                |
| `nesting`    | whether the role nests and how deep (`0`, a number, `"any"`)                                                                                         |
| `roles`      | structured role: the roles it contains (`gql/` → `queries/`, `mutations/`, `fragments/`)                                                             |
| `categories` | semi-structured role: category subdirectories required, names free (`definitions/<kind>/`)                                                           |
| `exports`    | export style, TypeScript and JavaScript only: `named-match`, `named`, `default`                                                                      |
| `index`      | an `index` file allowed (default: no)                                                                                                                |
| `public`     | modules importable one by one from other domains of the project, without `index.ts`; package exports only when the domain's visibility declares them |
| `discovered` | a consumer discovers its files (ESLint conventions, route files); the environments' `discovered` globs fold into it                                  |

## 6. `bin`, `scripts`, `tests`, `data` of engrenage

```
bin/engrenage/                 discovered commands; tree = command tree
├─ index.ts  init.ts  sync.ts  structure.ts  debt.ts  eslint.ts  tsdown.ts  vite.ts  vitest.ts  tsc.ts  prettier.ts
├─ pnpm/{index,upgrade}.ts
└─ agents/{index,rules,skills}.ts, claude/…, codex/…

scripts/
├─ codegen/                    one generator per output, inputs beside it
│  ├─ editions.ts              → src/project/baseline/…
│  ├─ apis.ts                  → data/apis/*.d.ts
│  ├─ rules.ts                 → src/tools/eslint/types/Rules.ts, types/rules/**
│  ├─ config.ts                → each domain's input type + composed Config (workflows/registry)
│  └─ barrels.ts               → @barrel blocks
└─ pnpm.ts

tests/                         one root (configurable, e.g. resources/tests); never colocated
├─ setup.ts  utils/  fixtures/
├─ bin/engrenage/…
└─ <src layout>/…              foundation/filesystem/x.test.src.ts, tools/tsdown/x.test.ts…
```

## 7. Config pipeline

```
foundation/options      declare(), flags, computed defaults           (no project knowledge)
        ▲
project/config          load raw input once per root (c12), memoized
                        resolves project sections lazily              get(section)
        ▲
tools/<tool>/config     declares its section
tools/<tool>/operations defineTsdownConfig() = raw → own section + get('build','baseline',…)
        ▲
workflows/registry      every section, eager validation, composed Config type, full loadConfig(root)
```

- Layered registry: no module imports a higher layer. The public `loadConfig(root)` of `project/config` serves external consumers.
- A section's resolver reads others through a lazy `get(section)`; cycles fail with their path. Sections are memoized per root.
- Unknown keys fail under eager validation (CLI, `--check`) and are ignored by a partial resolution.
- A domain exports an environment sub-schema under its name (`tsconfig`, `exports`); the registry composes each environment's schema from these contributions.
- Defaults are `{ value }` or `{ explain, compute(context) }`; the helper writes `@default` into descriptions; the `false` shorthand is normalized at the boundary; flags `optional` and `disable` first; callbacks may narrow the base schema only; resolved data are declared interfaces; input types are generated per domain.
- Option placement: general project and build configuration, and options valid for every engine of a kind, live in `engrenage.config.ts`; options of one tool live in its config file through `define<Tool>Config`. Tools without a config file (git, GitHub, VS Code, agents) keep their section in `engrenage.config.ts`. Options a command reads stay in `engrenage.config.ts`.
- Prettier: formatter-agnostic options (print width, quotes) in the `formatting` section; Prettier plugins and overrides in `prettier.config.ts` through `definePrettierConfig`, read by the Prettier adapter when it runs.
- Global settings: root, debug, cache, module type, Node and TypeScript versions. `define` becomes an environment sub-config; `build` the `build` contract's section; imports and exports the package-layout sub-config of each environment.
- One breaking release, with a changeset describing the migration.

## 8. Presets and traits

- Presets resolve into traits; resolvers read traits, never preset names. `project/presets` owns composition and trait derivation; no module inspects presets by hand.
- First traits: **owned directories** (directories a host owns; no environment default lands there) and **published** (§2).
- A preset's effect on an option is a computed default reading traits from context.
- pnpm stays the default package manager.

## 9. Aliases

- Generated by `engrenage sync`, never hand-maintained; relative imports stay avoided.
- One flat `#` namespace; sync fails on any collision (Node imports and bundler aliases together).
- **Root aliases**, for code environments only, from their directory names: `#src`, `#tests`, `#scripts`, `#bin`, `#tooling`; `#data` in apps (on by default), never in libraries; never output directories.
- **`src` aliases**: each flat entry of `src/` gets `#<name>`; a namespace may declare an alias prefix generating one alias per domain it holds (empty prefix: `#<domain>`), parent aliases staying valid.
- Two alias sets: the global set (top level) and the `src` set (in the `src` environment). Configuration can turn off the `src` set, turn off all aliasing, or define custom aliases replacing everything or the `src` set only.
- Root aliases are Node subpath imports in `package.json#imports`, which TypeScript, Vite and tsdown read natively.
- Bundler aliases are allowed only when the `src` environment is declared bundled (its code only runs through a bundler); `engrenage sync` fails otherwise. They are written once into the root tsconfig `paths`, which every environment inherits (so `bin` and `scripts` use them too) and which Vite, Vitest and tsdown read. Dist-mode tests resolve none of them.
- Engrenage's own namespaces declare an empty prefix, so its domains keep short aliases (`#tsdown/…`, `#config/…`); `#package.json` is a custom global alias.

## 10. Workspaces

- A config option declares workspace globs, each mapped to a name pattern (with `{dir}` interpolation), an environment and a tsconfig. One environment per glob; workspaces needing a different structure or runtime get their own glob (`extensions/functions-*` beside `extensions/action-*`).
- `engrenage sync` keeps the `packages` of `pnpm-workspace.yaml` in line with the globs, in the same pnpm workspace target as the shared settings.
- Per workspace, sync generates the `tsconfig.json` and the managed `package.json` keys: `name` from the pattern, `private`, `version` and `license` from the root, and `imports` with `#self/*` (`{ "types": ["./src/*.ts", "./src/*.tsx"], "default": "./src/*" }`); other keys are preserved.
- Shared code reaches workspaces through bundler aliases only.
- Workspaces import each other only through a declared dependency; the root `src/` never imports a workspace.
- Build entries (one per workspace), Vitest includes and ESLint scope derive from the declaration.
- Engrenage never models a host platform (CLI, TOML files, codegen configuration, locales, Wasm builds).

## 11. Mixed codebases

- Roles and domains apply only inside declared environment directories.
- Default-deny: engrenage lints, formats, scans and writes only declared environment directories and its own files; every derived scope (ESLint files, Prettier globs, ignore blocks) comes from the declared environments, never `**`.
- The `build` contract carries a clean policy: `emitted` (only files the build wrote) for output directories shared with a host, `all` for owned ones.
- Git and GitHub domains resolve the repository root separately from the project root.
- GitHub workflows engrenage writes are named `engrenage-*.yml`.
- Shared files are edited only through managed keys or marker blocks.

## 12. Strictness and the structure report

- Each environment is `strict` (default: every directory classified) or `loose` (unclassified directories are plain domains; only recognized roles checked).
- `engrenage structure` prints every directory's classification and source (`config`, `preset`, `inferred`), grouped by environment; `--check` fails on unclassified directories in `strict` environments only.

## 13. Lint

Every rule is an error.

| Source             | Rule                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Environments       | §2 import table                                                                                         |
| Tests, libraries   | `x.test.ts`, `x.test.dist.ts` import the package name only; `x.test.src.ts` never imports it            |
| Data, libraries    | `src` never references `data/`                                                                          |
| Workspaces         | root `src` never imports a workspace; workspaces import each other only through a declared dependency   |
| Global roles       | anything imports them; they import only each other                                                      |
| Layers             | a child imports lower layers and its own layer only; one allow list per layer                           |
| Sub-domains        | private to their parent unless declared public; peers through `index.ts`; public roles module by module |
| `utils/`, `types/` | §4                                                                                                      |
| Role contracts     | §5                                                                                                      |
| Domain content     | only roles, sub-domains and namespaces inside a domain                                                  |
