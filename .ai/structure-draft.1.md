# Structure draft 1: resolved state (plan #137)

Everything here is settled and matches #137 and its sub-issues. Open questions, proposals, conflicts and pitfalls live in `structure-draft.2.md`; once answered, they merge here. Points marked _(planner)_ were decided while folding the fourth round and are listed in draft 2 §1 for correction.

## 1. Core model

| Noun            | What it is                                                                                                                                    | Declared where                                     | Example                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| **Environment** | A runtime context with its own directories and import rights                                                                                  | config (exists today)                              | `src`, `bin`, `scripts`, `tests`, `data`, `tooling`     |
| **Namespace**   | A grouping directory: no `index.ts`, no roles, no concern; holds domains (and namespaces); carries the **layers** of its children as metadata | structure description, inferred when undeclared    | `foundation/`, `project/`, `tools/`, `workflows/`       |
| **Domain**      | Any directory that is neither a role nor a namespace, recursively; owns one concern; has one surface (`index.ts`)                             | implicit; metadata (visibility, purpose) declared  | `tools/tsdown`, `tools/agents/claude`                   |
| **Role**        | A directory or file name with a fixed meaning and a contract, valid at any depth                                                              | role catalogue (defaults, presets, project config) | `utils/`, `types/`, `errors/`, `constants.ts`, `*.d.ts` |

- All four names are final: "namespace" replaces the working name "tier"; "layer" names the ordering metadata, never a directory.
- Everything derives from these: lint boundaries (#150), agent guidance (#151), the structure report (#156), entry discovery (#154), aliases (§9), lint and format scope.
- `src/` is un-flattened with namespaces as directories (#139). The `src` root lists namespaces, global roles and root files.
- Classification has three layers, highest priority first: the project's configuration, preset defaults, inference from the filesystem. Engrenage ships defaults, every default is configurable, whatever is not declared is inferred.
- Filesystem cues for inference: a domain always has `index.ts`, a namespace never does, a role is a known role name.
- `engrenage structure` prints how every directory is classified (environment, namespace, domain, role, unclassified) and where each classification comes from (config, preset, inference), so a misread directory is visible before it skews lint (#156).

### Namespaces and layers

- A namespace groups; layers order. The two are separate: a namespace may declare no layers, and layers may rank domains as well as namespaces.
- `layers` is metadata of a namespace, ordering its non-role children from lowest to highest; `*` stands for every child not listed: `["support", "*", "ui"]`.
- _(planner)_ The environment root counts as a namespace for layers, while also holding the environment's global roles and, in a library, the root entry `index.ts`. That is what lets an app rank `support/` (namespace), flat business domains and a `ui/` domain without moving directories.
- A child may import global roles, lower layers and siblings in its own layer (through their `index.ts`); never a higher layer.
- Children of a namespace without `layers` are unordered: each imports any sibling through its `index.ts`.
- Namespaces and layers are allowed at any depth (`<domain>/resources/<sub-domain>`), with identical rules.
- The direction is lintable: #150 generates, from the declared layers, one allow list per layer for eslint-plugin-boundaries (verification on a prototype pending in #138, step 1).

### Telling roles from namespaces and domains

- Roles form a short, known vocabulary: the defaults, plus those the project or its presets enable or define. No plural convention, no sigil.
- A role directory that is empty, or that holds an `index` its contract does not allow, fails: this catches a role name used by mistake for a domain. _(planner)_ ESLint only sees files, so the empty-directory check belongs to `engrenage structure --check`; the `index` check is an ESLint role-contract rule.
- `engrenage structure` reports a directory it cannot classify, so a missing role definition and a genuine misplacement both surface.
- A domain named like a role opts out of role detection (#141). In engrenage, `project/config` needs no opt-out: children of a namespace are never roles.

## 2. Environments: graph, imports, exposure

```
                  ┌──────────────────────────────────────────────┐
                  │ tooling: root config files + tooling/        │
                  └──────────────────────┬───────────────────────┘
                                         │ public entries (libraries) / declared domain surfaces (apps)
                                         ▼
  bin ─────────── imports ───────▶ ┌───────────┐ ── library: reads at runtime ──▶ data
  scripts ─────── imports ───────▶ │    src    │    through the public specifier
  tests ───────── imports ───────▶ └───────────┘ ── app: imports through #data ──▶ data
    │                                    ▲                                        ▲
    ├── spawns ──▶ bin (source) or the built executable (dist mode)               │
    ├── imports ─▶ scripts         scripts ── writes generated files ─────────────┘
    └── reads ───▶ tests/fixtures
```

| from ↓ / to → | `src` public                                   | `src` internal (`#…`)                     | `bin`                 | `scripts` | `tests` | `data`                                                  |
| ------------- | ---------------------------------------------- | ----------------------------------------- | --------------------- | --------- | ------- | ------------------------------------------------------- |
| `src`         | own rules (§3)                                 | own rules (§3)                            | never                 | never     | never   | library: runtime, public specifier only; app: `#data/…` |
| `bin`         | yes                                            | yes                                       | own command tree only | never     | never   | never directly                                          |
| `scripts`     | yes                                            | yes                                       | never                 | own       | never   | read/write by path (generated files)                    |
| `tests`       | library: package name only (agnostic variants) | library: `.test.src.ts` only; app: always | spawn only            | yes       | own     | library: public specifier; app: `#data/…`               |
| `tooling`     | library: public entries only                   | app: declared domain surfaces             | never                 | never     | never   | never                                                   |
| `data`        | not code                                       |                                           |                       |           |         |                                                         |

| Environment | Exposes                                                                           | Contents                                                                                                |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src`       | public entries (declared visibility, `src.exports`); `#` subpaths inside the repo | namespaces → domains → roles                                                                            |
| `bin`       | executables (`package.json#bin`)                                                  | discovered command files; thin: parse input, then call a domain capability                              |
| `scripts`   | nothing (run by package scripts)                                                  | generators with their inputs beside them (#147), maintenance scripts                                    |
| `tests`     | nothing                                                                           | tests mirroring the `src` layout, with mode variants in libraries (§6); its own roles                   |
| `data`      | library: published files (`data.exports`); app: modules imported through `#data`  | no roles, no structure lint                                                                             |
| `tooling`   | config files consumed by tools                                                    | root config files plus `tooling/` for project-specific tool configuration code; dogfoods public entries |

### Library versus app

- _(planner)_ The difference is a trait, **published**, which the `library` preset resolves to (§8). Every rule below that says "library" reads that trait, never the preset name.

| Concern            | Library (published)                                               | App (not published)                                    |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Dist testing       | on: source and dist modes, test variants, import constraints (§6) | off: no dist mode, no variants, no tests dist tsconfig |
| Tests import `src` | agnostic tests by package name; `.test.src.ts` by `#…`            | by `#…` aliases                                        |
| `src` → `data`     | runtime only, through the public specifier (`foundation/data`)    | static imports through `#data/…`                       |
| `#data` alias      | never                                                             | on by default                                          |
| `tooling` → `src`  | public entries only                                               | declared domain surfaces                               |

### Tests and dist (#155), libraries

- Variants are named by suffix, beside each other in the same directory:

  | File             | Runs in          | Imports                                               |
  | ---------------- | ---------------- | ----------------------------------------------------- |
  | `x.test.ts`      | source and dist  | public specifiers only (`@auaust/engrenage/…`)        |
  | `x.test.src.ts`  | source mode only | internals through `#…`; never the package name        |
  | `x.test.dist.ts` | dist mode only   | public specifiers only; may reach dist-only artefacts |

- Verified on Vitest 5.0.5: the default `include` skips `x.test.src.ts` and `x.test.dist.ts`, and a mode-dependent `include` (`**/*.test.ts` plus `**/*.test.<mode>.ts`) selects them. The suffix must follow `.test`: `x.dist.test.ts` matches the default and would run in both modes.
- Source mode maps the public specifiers to `src/` through tests tsconfig `paths` generated from `src.exports` (never a `*` wildcard), and fails on any resolution into `dist/` (`createOutDirGuard`).
- Dist mode resolves public specifiers through `exports` to `dist/`; a plugin fails hard on any resolution into `src/`. `src/` stays on disk (it is in `files`); the guard is what makes the suite independent of it.
- Tests of the executable spawn it per mode: the `bin` entry file in source mode, the built executable from `package.json#bin` in dist mode.
- No test silently runs against `src/` in dist mode: a `.test.src.ts` file never runs there.
- Most of engrenage stays internal, so most current tests become `.test.src.ts`; #154 widens the public surface, moving tests back to agnostic.
- Type-only tests (`x.test.types.ts` or Vitest's `x.test-d.ts`) are out of scope for now.

### Data

- Libraries: `src/` never imports `data/` at build time and has no `#data` alias, since a bundled copy would give data two identities. Data is reached at runtime through the package's public specifier by `foundation/data` (ESM-aware per #9), so source and dist modes resolve the same file.
- Apps: `src/` imports `data/` statically through `#data/…`; nothing consumes the app from `node_modules`, so there is no second identity.
- `data/` has no roles and no structure lint: its public interface (`data.exports`) defines its layout in libraries.

### Tooling

- Project-specific tool configuration code (an app's UnoCSS plugins, ESLint rule sets) lives in `tooling/`, never in `scripts/` or `src/`. No root `config/` directory: backend frameworks (Laravel, Kirby) own that name.
- `tooling/` uses the same roles as `src`, no layers, one domain per tool (`tooling/unocss/plugins/…`), imported by root config files through `#tooling/…`.

## 3. `src/` of engrenage

```
src/                       environment root; layers: foundation < project < tools < workflows
├─ index.ts                root entry; re-exports global types/utils barrels
├─ constants.ts
├─ types/                  global types (Directory, File, Glob, PackageName, SyncResult…)
├─ utils/                  global pure helpers (filesIn and syncFiles move out: impure)
│
├─ foundation/             namespace: engrenage's own infrastructure; knows nothing of the project config
│  ├─ filesystem/          staged filesystem, virtual files (file-editing.1), filesIn
│  ├─ processes/           spawn wrappers (debt.2)
│  ├─ data/                runtime data access through the public specifier (#9, debt.4)
│  ├─ json/                JSON read/write
│  ├─ blocks/              marker blocks and sync primitives: syncBlocks, syncFiles, syncIgnoreFile (#9)
│  └─ options/             declaration helper over valibot (#146), validate
│
├─ project/                namespace: tool-agnostic models, contracts, config loading
│  ├─ config/              raw loading (c12), root (#56), lazy sections, global settings, loadConfig(root)
│  ├─ structure/           project structure description (#148)
│  ├─ environments/        environment model; composes the sub-configs below per environment
│  ├─ presets/             presets, composition and the traits they resolve to (§8)
│  ├─ package/             package.json model, exports/imports sub-config, canonical order
│  ├─ tsconfig/            tsconfig model, environment tsconfig sub-config, key order (typescript.7)
│  ├─ baseline/            runtime and baseline: Node runtime, ES editions
│  ├─ build/               build contract: ports, entries, output, target, formats, clean policy
│  └─ formatting/          formatting contract: ports, formatContent / formatFile (#154)
│
├─ tools/                  namespace: one domain per external tool: options, files, adapters
│  ├─ typescript/  eslint/  prettier/  pnpm/  tsdown/  vite/  vitest/
│  ├─ changesets/  git/  github/  vscode/
│  └─ agents/              claude/, codex/ (public sub-domains)
│
└─ workflows/              namespace: composition, wires adapters to ports, runs across domains
   ├─ registry/            full registry: every section, eager validation, composed Config type
   ├─ init/                collects and orders every domain's init steps
   ├─ sync/                collects every domain's sync targets; injects the formatter
   └─ cli/                 commander and scaffold plumbing for bin
```

### Layers of engrenage's `src`

| from ↓ / to → | global roles | `foundation`            | `project`               | `tools`                                 | `workflows`             |
| ------------- | ------------ | ----------------------- | ----------------------- | --------------------------------------- | ----------------------- |
| `foundation`  | ✓            | siblings via `index.ts` | ✗                       | ✗                                       | ✗                       |
| `project`     | ✓            | ✓                       | siblings via `index.ts` | ✗                                       | ✗                       |
| `tools`       | ✓            | ✓                       | ✓                       | siblings via `index.ts` (vitest → vite) | ✗                       |
| `workflows`   | ✓            | ✓                       | ✓                       | ✓                                       | siblings via `index.ts` |

- Each domain has its own `index.ts`; a namespace has none. "Siblings via `index.ts`" means `foundation/blocks` imports `foundation/filesystem/index.ts`.
- Global roles import only each other.
- Public roles (§5) are the one exception to "through `index.ts`": their modules are importable one by one from outside the domain, within the layer rules.
- Cycles are not enforced by any tool: the conventions above prevent them, and module evaluation errors reveal the rest (draft 2 §3 records the limits).
- Public entry paths decouple from directories through `src.exports`: `@auaust/engrenage/tsdown` can point at `src/tools/tsdown/index.ts`.
- Visibility (#154): `foundation` and `workflows` internal; `project` partly public (`config`, `package`, `baseline`, `formatting`); `tools` public. Everything is internal unless declared public.

### Placement answers

- Generic option-declaration machinery is `foundation/options` (no project knowledge); engrenage's project config built with it is `project/config`.
- Each tool's `config/` role declares its section with `foundation/options`. A definer loads raw input (`project/config`), resolves its own section and reads lower sections (global settings, baseline, tsconfig) through the lazy `get` (#143).
- The tsconfig model, package layout and baseline are project models below every tool, because environments compose their sub-configs. `tools/typescript` consumes the tsconfig model like ESLint, tsdown and Vitest do.
- Contract domains hold their interfaces in `ports/` (`project/formatting/ports/`); tool domains implement them in `adapters/` (`tools/prettier/adapters/`); `workflows` injects adapters into ports.
- A domain owns the logic of its capabilities (what to read, change or generate); `workflows/cli` turns capabilities into commands and handles CLI input; `bin/` stays a discovered command tree of thin commands.
- Tools engrenage needs itself (ESLint, Prettier, pnpm) get no namespace of their own: requiredness is dependency metadata. A capability engrenage needs from a tool goes through a port whose adapter `workflows` injects (formatting), or is composition in `workflows`.

## 4. Inside a domain

```
tools/tsdown/
├─ index.ts           public surface (only file outsiders import, except public roles)
├─ constants.ts       deeply read-only domain constants (also the home of hard-coded app data)
├─ config/            declaration of the domain's options (engrenage-defined role, §5)
├─ setup/             init steps and sync targets (engrenage-defined role)
├─ plugins/           the tool's own plugins (engrenage-defined role)
├─ adapters/          implementations of other domains' ports (public)
├─ <operations role>/ impure logic and definers (name: draft 2 §2)
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
- Definers (`define…Config`) live in the operations role; the pure declaration stays in `config/`. Under the layered registry, the definer is the only module of a tool domain that loads raw input.
- The home of impure logic is the project's choice, not engrenage's: engrenage ships no default role for it. Engrenage itself defines **one** role for it, because measured on `main` its domains hold few impure modules outside `setup/` (1–2 for most; 5–7 for `typescript`, `config` and `agents`, of which generators and definers move elsewhere) and no subcategory justifies a split. Its name is open (draft 2 §2).

## 5. Roles

### Catalogue

- Roles are on by default when it is reasonable to assume the name never serves another purpose, does not conflict with another role and means the same in every environment.

| Role           | Kind      | Default | Public | Holds                                                     | Contract                                                  |
| -------------- | --------- | ------- | ------ | --------------------------------------------------------- | --------------------------------------------------------- |
| `index.ts`     | file      | yes     | —      | domain surface                                            | no local values except a SCREAMING_CASE metadata constant |
| `constants.ts` | file      | yes     | no     | deeply read-only constants, enums as const objects        | type-aware read-only check                                |
| `*.d.ts`       | file      | yes     | no     | ambient declarations (`env.d.ts`)                         | none                                                      |
| `types/`       | directory | yes     | no     | types only                                                | single export, name match, no local declarations          |
| `utils/`       | directory | yes     | no     | `src`: pure contained logic; `tests`: shared test helpers | single export, name match                                 |
| `errors/`      | directory | yes     | yes    | error classes callers catch                               | single export, name match                                 |
| `enums/`       | directory | yes     | no     | enums, for domains declaring many                         | single export, name match                                 |
| `ports/`       | directory | yes     | yes    | interfaces whose implementations are injected             | single export, name match, types only                     |
| `adapters/`    | directory | yes     | yes    | implementations of ports                                  | single export, name match                                 |
| `fixtures/`    | directory | tests   | —      | fixture projects and files                                | none (not code)                                           |
| `setup.ts`     | file      | tests   | —      | test setup, discovered                                    | discovered                                                |

- `ports/` and `adapters/` replace the earlier `contracts/` role name; "contract" now means only a role's contract and a contract domain.
- _(planner)_ `ports/` holds only the interfaces a domain expects implementations of; every other type stays in `types/`.
- Engrenage defines `config/`, `setup/`, `plugins/` and its operations role in its own configuration (`define`), since their meaning is engrenage-specific. What else ships off by default is in draft 2 §2.
- Dropped: `internals/` (everything is internal unless exposed) and `helpers/` (overlaps `utils/`). A project may still define either as a genuine role of its own (toolkit's `internals/`); toolkit needs no refactor.
- No `classes/` role: roles describe what code is for. An error class goes to `errors/`, a stateful service to the operations role, a value object with the types or utils it serves.
- No catch-all role. A file that fits nowhere reveals a missing role or domain, and #156 reports it:

  | File                         | Home                                                                                    |
  | ---------------------------- | --------------------------------------------------------------------------------------- |
  | Static data imported by code | a role whose contract accepts its files (a `data/` role: draft 2 §2)                    |
  | Runtime data                 | `data/` environment                                                                     |
  | Generator inputs             | beside the generator (#147)                                                             |
  | Styles                       | beside their component (a `components/` contract accepting `*.css`) or a `styles/` role |

- Hard-coded app data belongs in the domain's `constants.ts`, not in a `config/` directory; `config/` stays a valid role name.

### Configuration

```ts
roles: {
  enable: ["…"],        // known role keys, type-safe
  disable: ["enums"],   // known role keys, type-safe
  define: { name: contract },
}
```

- `enable` and `disable` apply to the defaults first; `define` applies after them and may redefine an existing role.
- _(planner)_ `roles` exists at the top level (project catalogue) and in each environment (refining that environment's set); the top level applies first. `tests` adds `fixtures/` and `setup.ts`; `bin` has no roles, since its whole tree is discovered commands.
- Role aliases map an existing directory name to a role's contract (`helpers/` read as `utils`), for adopting existing codebases; opt-outs cover the reverse case.

### Contracts

A role contract, configurable for built-in and custom roles alike and enforced by lint, declares:

- **Kind and match.** A file role matches a name given as a string or a list of strings, globs included (`"constants.ts"`, `["*.d.ts"]`, `["+page.ts"]`); a directory role matches its directory name.
- **Accepted files**, as a string or a list of strings, globs included (`["*.tsx", "*.css"]`).
- **Nesting**: whether the role nests and how deep.
- **Structure**: a _structured_ role lists the roles it contains (`gql/` holds `queries/`, `mutations/`, `fragments/`); a _semi-structured_ role requires category subdirectories without naming them (`definitions/<kind>/`).
- **Export style** (single named export matching the file name, named, default), TypeScript and JavaScript files only.
- **`index`**: allowed or not (not by default).
- **Public**: modules importable one by one from outside the domain, without the domain's `index.ts`. That keeps per-module bundling: an app imports definitions one by one, out of barrels. _(planner)_ Public inside the project only: the modules become package exports only when the domain's visibility declares them.
- **Discovered**: a consumer discovers its files (ESLint conventions, route files, plugins). Such roles are called **discovered roles**; the environments' `discovered` globs fold into their contracts.
- Free-standing framework files (SvelteKit `+page.ts`) are file roles with globs and no export contract, added when the first app needs them.

## 6. `bin`, `scripts`, `tests`, `data`

```
bin/engrenage/                 discovered commands; tree = command tree; no roles
├─ index.ts  init.ts  sync.ts  structure.ts  debt.ts  eslint.ts  tsdown.ts  vite.ts  vitest.ts  tsc.ts  prettier.ts
├─ pnpm/{index,upgrade}.ts
└─ agents/{index,rules,skills}.ts, claude/…, codex/…

scripts/
├─ codegen/                    one generator per domain it writes into (#147)
│  ├─ editions.ts              → src/project/baseline/…   inputs (esMemberCompatKeys…) beside it
│  ├─ apis.ts                  → data/apis/*.d.ts
│  ├─ rules.ts                 → src/tools/eslint/types/Rules.ts, types/rules/**
│  ├─ config.ts                → each domain's input type + composed Config (workflows/registry)
│  └─ barrels.ts               → @barrel blocks (#51)
└─ pnpm.ts

tests/                         one root (custom root allowed, e.g. resources/tests); never colocated
├─ setup.ts                    discovered file role
├─ utils/  fixtures/           roles
├─ bin/engrenage/…             x.test.ts spawns the executable per mode; x.test.dist.ts dist only
└─ <src layout>/…              mirrors src: foundation/filesystem/x.test.src.ts, tools/tsdown/x.test.ts…

data/                          layout follows data.exports
├─ agents/{rules,sections,skills,templates}
├─ apis/                       (generated)
├─ github/workflows/
└─ tsconfig/
```

- _(planner)_ Tests mirror the layout of the environment they test, whatever their variant, so a source file's tests sit in one place.

## 7. Config pipeline

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

- Layered registry (#143 option (d), formerly "tiered"): no module imports upward, so the registry needs no role-level exception. The public `loadConfig(root)` of `project/config` covers external needs; the full one sits in `workflows/registry`.
- Option placement (#153): general project and build configuration, and any option that holds for every engine of its kind, lives in `engrenage.config.ts`; an option specific to one tool lives in that tool's own config file through `define<Tool>Config({ … })`.
- Tools without a config file of their own (git, GitHub, VS Code, agents) keep their section in `engrenage.config.ts`.
- Any option an engrenage command reads belongs in `engrenage.config.ts`; definer options affect only that tool's own run, so the CLI never loads a tool's config file.
- Prettier: formatting options any formatter understands (print width, quotes) live in the `formatting` contract's section of `engrenage.config.ts`; Prettier plugins and overrides live in a `prettier.config.ts` through a new `definePrettierConfig`, read by the Prettier adapter only when it runs.

## 8. Presets, traits and project kinds

- Presets exist at project level and per environment (#153), and resolve into traits; resolvers read traits, never preset names (`configuration.2`). `project/presets` owns preset composition and trait derivation.
- First traits: **owned directories** (the directories a host owns, from which "default environment paths are safe" derives) and _(planner)_ **published** (§2, from the `library` preset).
- Host presets (`shopify-theme`, `shopify-extensions`, `laravel`), each a thin bundle of traits, are added when a project adopts engrenage.
- pnpm stays the default package manager.
- Tests have one root directory, configurable (`resources/tests` when a host owns `tests/`); colocated tests are out of scope for now.

## 9. Aliases

- Relative imports stay avoided. Aliases are generated by `engrenage sync`, never hand-maintained.
- One flat `#` namespace by default. `engrenage sync` fails on a collision; the fix is to disable `src` aliases, redefine them, or rename the colliding directory.
- **Root aliases** exist only for code environments, from their actual directory names: `#src`, `#tests`, `#scripts`, `#bin`, _(planner)_ `#tooling`. `#data` exists in apps, on by default, never in libraries. Output directories (`#dist`) never get one; the build output is reached through the package name only.
- **`src` aliases**: each flat entry of `src/` gets `#<name>` (`#foundation`, `#types`, `#utils`); a namespace can be assigned an alias prefix generating one alias per domain it holds, parent aliases staying valid beside it.
- Two alias sets, at two configuration levels: the global set (top level: root aliases) and the `src` set (in the `src` environment config).
- Configuration can: opt out of `src` aliases only (keeping `#src`, `#tests`…), opt out of all aliasing, or define custom aliases, either replacing everything or replacing the `src` set only.
- Root aliases are Node subpath imports (`package.json#imports`) only. Custom `src` aliases may be bundler aliases.
- _(planner)_ TypeScript (`nodenext` and `bundler` resolution) and Vite read `package.json#imports` natively, so Node imports need no tsconfig `paths` or Vite alias. Bundler aliases are written to tsconfig `paths` only, which Vite and Vitest read through `resolve.tsconfigPaths`. The collision check covers both sets, so a key never means one thing to Node and another to TypeScript.
- Tests resolve public specifiers per mode (§2); `.test.src.ts` and app tests use the `#` aliases.

## 10. Workspaces

- Workspace support is in the plan (#157, absorbing the direction of #53): a config option declares workspace globs and maps each to a naming convention, an environment and a tsconfig.
- `engrenage sync` keeps `pnpm-workspace.yaml` packages in line with the declared globs and generates or syncs each workspace's `tsconfig.json` and managed `package.json` keys.
- Workspaces are linted with the rest of the project and have boundaries: at least, the root `src/` never imports a workspace.
- Engrenage provides recognition, generated package files, linting, boundaries and tool discovery for workspaces; it never models a host platform.
- In scope for an extensions app: the workspace declaration; generated `package.json` keys and tsconfigs; `pnpm-workspace.yaml` packages; the environment's role set; build entries (one per workspace); Vitest includes; lint scope and boundaries; typecheck. Out of scope: the host CLI, TOML files, GraphQL codegen configuration, locales (foreign files or `generated` globs), the Function's Wasm build.
- A `shopify-extensions` project preset bundles the extensions glob and its environment (Preact JSX, Polaris types, no Node built-ins), the discovered `pages/` role, foreign host files, build entries and "never published".

## 11. Mixed codebases

- Roles and domains apply only inside declared environment directories: a host's root `config/` (Shopify theme, Laravel) is never the `config` role.
- **Default-deny**: engrenage lints, formats, scans and writes only declared environment directories and its own files. In output directories it does not own, it touches only the files it emitted.
- Every derived scope (ESLint files, Prettier globs, ignore blocks, structure lint) comes from the declared environments, never `**`.
- **Host directories**: presets declare the directories the host owns (owned-directories trait), so no environment default lands there.
- **Repository root versus project root (#56)**: the git and GitHub domains resolve the repository root separately, for a plugin or theme living in a subdirectory.
- **Workflow prefix**: GitHub workflows engrenage writes are named `engrenage-*.yml`, so they never collide with host CI.
- The `build` contract carries a clean policy: `emitted` for output directories shared with a host (Shopify theme `assets/`), `all` for owned directories.
- Shared files (`package.json`, ignore files, `.vscode/settings.json`, `AGENTS.md`) are edited only through managed keys or marker blocks.

## 12. Strictness and the structure report

- Each environment is `strict` (default: every directory classified, `engrenage structure --check` fails otherwise) or `loose` (unclassified directories are plain domains; only recognized roles are checked).
- _(planner)_ `engrenage structure --check` fails only on `strict` environments; a `--json` output is added when a consumer needs it.

## 13. Model limits already covered

| Risk                                                              | Mitigation                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| A host or framework directory is named like a role                | opt-out per directory (#141); roles only inside environments |
| A role name used by mistake for a domain                          | empty role directory or unexpected `index` fails (§1)        |
| Single export / name match on non-TS files (Vue SFC, CSS, Liquid) | export contracts are TS/JS only                              |
| App layers (FSD), a UI domain above business domains              | layers as namespace metadata, `*` for the rest               |
| Per-module bundling of definitions                                | public roles                                                 |
| Deep public paths                                                 | exports decoupled from directories (exists)                  |
| A directory misclassified by inference                            | `engrenage structure` report and config override             |

## 14. Settled in the fourth round (written into the issues)

- #137: steps reordered (#155 first with #138, #156 right after #148); Direction and Decisions updated.
- #139: names namespace and domain; layers as namespace metadata; tools engrenage needs (a).
- #141: no cycle enforcement; public roles bypass `index.ts`; namespaces and layers at any depth.
- #142: default-on catalogue with `enable`/`disable`/`define`; `errors/`, `enums/`, `ports/`, `adapters/` defaults; public roles; file roles with globs; structured and semi-structured roles; discovered roles; no default operations role, engrenage defines one; definers in it; `config/` valid.
- #148: flat alias namespace with opt-outs and custom sets; aliases only for code environments, `#data` in apps; Node imports for roots, bundler aliases for custom `src` sets; tooling → app domain surfaces; ownership rules; role aliases; strictness.
- #150: no cycle rule; layer allow lists; library-only test and data rules.
- #153: Prettier split; traits (owned directories, published); host presets; `project/presets`.
- #155: suffix variants, verified on Vitest; executable per mode; plugin guard; generated source mapping; library only.
- #156: moved right after #148; `--check` on strict environments only.
