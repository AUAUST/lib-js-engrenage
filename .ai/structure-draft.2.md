# Structure draft 2: open items (plan #137)

The diff that still needs answers before it merges into `structure-draft.1.md`. Nothing settled in draft 1 is repeated here. Each item names its kind, the issue whose **Questions** section carries it, what investigation found, the options and a recommendation.

Kinds: **Question** (needs your choice), **Planner** (decided while folding your answers, written into draft 1 and the issues as decided; correct if wrong), **Pitfall** (a consequence found while mapping), **Proposal** (a suggestion, nothing asked yet).

## 1. Planner decisions to confirm

Each is marked _(planner)_ in draft 1 and listed as "planner's decision, correct if wrong" in its issue.

1. **Reading of "layers are metadata of namespaces"** (#139). A namespace carries `layers`, ordering its children of any kind (namespaces and domains, `*` for the rest). The environment root counts as a namespace for this, while also holding global roles and a library's root `index.ts`: without that, the app case (`support/` below flat domains, `ui/` above them) has nowhere to declare its order. A domain cannot order its sub-domains; a namespace is inserted when that is needed.
2. **Where "empty role directory fails" runs** (#142, #156). ESLint only sees files, and git never tracks an empty directory, so the empty-directory check runs in `engrenage structure --check`. The "`index` in a role directory" check is an ESLint role-contract rule.
3. **Library versus app is a trait, `published`** (#153, #155, #148). The `library` preset resolves to it. It turns on dist testing (variants, import constraints, tests dist tsconfig), forbids `#data`, keeps `src → data` at runtime only and limits `tooling` to public entries. Projects without it lose the tests dist tsconfig they get today: that is a behaviour change for the breaking release's changeset.
4. **`roles` at two levels** (#142, #148). The top level edits the project catalogue, each environment refines its own set, top level first. `tests` adds `fixtures/` and the `setup.ts` file role.
5. **`bin` has no roles** (#142). Draft 1 said both "core roles are valid in every code environment" and "`bin`: no roles". Every file under `bin/` is a discovered command, so a role there would read as a command; `bin` keeps no roles.
6. **`ports/` holds only injected interfaces** (#142). `ports/` holds the interfaces whose implementations `adapters/` provide and `workflows` injects; every other type stays in `types/`. Without that line, the two roles overlap (both hold types only).
7. **Tests mirror the tested environment's layout** (#155). All variants of a file's tests sit side by side under the same mirrored path (`tests/tools/tsdown/…`, `tests/bin/engrenage/…`). That is what "avoid searching three locations" needs.
8. **`#tooling` is a root alias** (#148). Your list of sensible roots was `src`, `tests`, `scripts`, `bin`, but you also accepted `tooling/` imported through `#tooling/…`. The rule I wrote: root aliases for code environments only, `#data` only in apps, never output directories.
9. **How aliases reach TypeScript and Vite** (#148). TypeScript (`nodenext` and `bundler`) and Vite resolve `package.json#imports` natively, so Node imports are written only there. Bundler aliases are written only to tsconfig `paths`, which Vite and Vitest already read through `resolve.tsconfigPaths` (`createVitestConfig` sets it today). The collision check covers both sets, so a key never resolves one way in Node and another in TypeScript.
10. **`engrenage structure --check` fails only on `strict` environments; `--json` when a consumer needs it** (#156).
11. **Tree order** (#137). #155 and #138 form the first block (independent, both pickable now); #156 sits alone right after #148 and before the migration; block #149 keeps #150 and #151.
12. **"Tiered registry" renamed "layered registry"** (#143), following the namespace and layer vocabulary.
13. **"Public" roles are public inside the project, not package exports** (#142, #154). A public role's modules may be imported one by one from other domains of the same project. They become `@auaust/engrenage/…` exports only when the domain's visibility declares them, so "everything internal unless declared public" still holds for the package.
14. **The interim test-import rule and the preset check in #155** (#155). #155 lands before traits and generated boundaries exist, so it keys on the `library` preset (with a `@debt` marker pointing to the `published` trait) and enforces variant imports with an ESLint convention that #150 later replaces.

## 2. Questions

### Name of engrenage's operations role (#142)

You put the impure-logic role in the project's hands, with the split decided by volume. On `main`, outside `setup/`, most domains hold 1–2 impure modules; `typescript` holds 7, `config` 6, `agents` 5. Generators leave for `scripts/`, definers are one per tool, and the `typescript` split spreads its modules over `project/tsconfig`, `project/baseline` and `tools/typescript`. No subcategory reaches a size that justifies its own role. So engrenage defines **one** role (settled in draft 1); only its name is open.

| Name          | For                                                     | Against                                                               |
| ------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| `operations/` | neutral; covers resolvers, producers, readers, definers | longer                                                                |
| `actions/`    | already used for this in an app                         | Redux and server actions read it as "triggered by a user or an event" |
| `services/`   | familiar                                                | implies stateful classes and dependency injection                     |

Recommendation: `operations/`.

### Off-by-default catalogue (#142)

`enable` takes type-safe known keys, so engrenage ships roles that are known but off by default. Which ones?

- Engrenage's own `config/`, `setup/`, `plugins/` and operations role carry engrenage-specific meanings (option declarations through `foundation/options`, init steps and sync targets). Shipping them to every project contradicts your default criterion.
- Recommendation:
  - engrenage defines those four in its own `engrenage.config.ts` through `define`;
  - the shipped catalogue holds only roles with a meaning shared across AUAUST projects, enabled by the presets that use them: `schemas/`, `components/`, `hooks/`, `contexts/`, `pages/` (discovered), `styles/`;
  - the catalogue grows when a preset needs a role.

### A `data/` role for static, domain-scoped resources (#142)

You asked for the trade-offs of a default `data/` role accepting JSON and other static files.

| For                                                                  | Against                                                                                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One obvious home for JSON, YAML and similar files imported by code   | Three meanings for one word: the `data` environment (and `#data` in apps), the `foundation/data` domain, and the role                                        |
| Its contract can accept exactly those files (`["*.json", "*.yaml"]`) | Fails your default criterion: apps and backends use `data/` for data-access code (repositories, loaders, fetchers)                                           |
| Consistent across projects                                           | In a library, a file imported from `src` is bundled; a file consumers also read at runtime belongs in the `data` environment, so the role invites duplicates |

- (a) Default `data/` role.
- (b) Off-by-default catalogue role, enabled by projects or presets that need it, under a name that does not collide: `assets/` (frontend usage: static files imported by code) or `static/`.
- (c) No role. Static values stay TypeScript in `constants.ts`, typed and checked read-only; files needing a home use a project-defined role.
- Recommendation: (c) by default and (b) as `assets/`. Most domain-scoped static data reads better as typed constants, and `data` already names an environment.

### What "inferred" means for layers (#139)

You said layers are "configured (or inferred)". Order can't be read from directory names. The only source to infer it from is the import graph, and enforcing an order inferred from imports would ratify every existing violation.

- (a) No inference: undeclared layers mean unordered children.
- (b) Presets provide layers by convention (an FSD preset declares `app > pages > widgets > features > entities > shared`). That is a preset default, not inference.
- (c) `engrenage structure` suggests an order from the observed imports, never enforced.
- Recommendation: (a) plus (b), with (c) later if it proves useful.

### Role contract field names (#142, proposal)

The capabilities are settled (draft 1 §5); the field names are not.

```ts
roles: {
  enable: ["components", "hooks"],
  disable: ["enums"],
  define: {
    operations:   { exports: "named-match" },
    conventions:  { exports: "default", nesting: 1, discovered: true },
    definitions:  { exports: "named", categories: "required", public: true },  // semi-structured
    gql:          { roles: ["queries", "mutations", "fragments", "selections", "schemas"] },  // structured
    pages:        { exports: "default", nesting: "any", discovered: true, accepts: ["*.tsx"] },
    components:   { exports: "named-match", accepts: ["*.tsx", "*.css"] },
    declarations: { file: ["*.d.ts"] },  // file role, no contract
    constants:    { file: "constants.ts", readonly: "deep" },
  },
}
```

- A file role is declared with `file` (string or list, globs), a directory role by its key; `accepts` lists the files a directory role takes.
- Your note said "files should accept strings and lists of strings, including globs". A single `files` field whose meaning depends on the role kind is the alternative, but one name for two meanings reads worse.
- Recommendation: `file` and `accepts`.

### Workspaces (#157)

Still open from the issue; your alias answers shape the second point.

- **Mapping to environments.** (a) One environment per workspace glob (`extensions`), each workspace a domain root inside it; (b) one environment per workspace. Recommendation: (a): extensions share runtime, roles and import rights. A workspace with another runtime (a Shopify Function) gets its own glob.
- **Shared code across workspaces.** Node `imports` can't leave a package (`ERR_INVALID_PACKAGE_TARGET`), and your answer allows bundler aliases in custom sets. (a) Generated tsconfig `paths` for bundler-only workspace environments; (b) the shared code as a workspace package (`workspace:*`, `exports`) when Node runs it. Recommendation: (a) by default, (b) when Node runs the code (see §3, bundler aliases).
- **Generated `package.json` keys.** Name from a pattern (`@scope/app-{dir}`), `private`, `version` and `license` from the root; foreign keys preserved. Recommendation: managed keys only.
- **Boundaries between workspaces.** Workspaces never import each other unless a dependency is declared. Recommendation: yes.
- **Tool discovery.** Build entries (one Vite library entry per workspace), Vitest includes and ESLint scope derived from the declaration. Recommendation: yes, through the `build` contract's entries.
- **#53.** Whether the shared `pnpm-workspace.yaml` settings target is part of the workspace sync target or beside it. Recommendation: one `pnpm-workspace.yaml` target in `tools/pnpm`, with packages and shared settings as two managed key sets.

### Generated rule set and severities (#150)

Updated with the fourth round; still to confirm as a whole.

| Source                  | Rule                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Environments            | `tests`, `scripts`, `bin` may import `src`; `src` never imports them; `tooling` per §2 of draft 1          |
| Tests (#155), libraries | `x.test.ts` and `x.test.dist.ts` import the package name only; `x.test.src.ts` never imports it            |
| Data, libraries         | `src` never references `data/`                                                                             |
| Workspaces (#157)       | root `src` never imports a workspace; workspaces import each other only when declared                      |
| Global roles            | anything imports them; they import only each other                                                         |
| Layers (#139)           | a child imports lower layers and its own layer only; one allow list per layer                              |
| Sub-domains (#141)      | private to their parent unless declared public; siblings through `index.ts`; public roles module by module |
| `utils/`, `types/`      | as draft 1 §4                                                                                              |
| Role contracts (#142)   | match, accepted files, nesting, structure, export style, `index`, public, discovery                        |
| Domain content (#141)   | only roles, sub-domains and namespaces inside a domain                                                     |

Recommendation: every rule an error. Warnings get ignored, suppressions need an explicit request, and `loose` environments already cover incremental adoption.

## 3. Pitfalls

- **Cycles are not reliably caught at runtime** (#141, #150). You chose no enforcement, relying on module resolution errors. An ESM cycle only throws when a `const` or class binding is read during evaluation before its module has run (TDZ `ReferenceError`). Function declarations are hoisted, so many cycles work silently, and type-only cycles never fail. The bundled `dist` can evaluate modules in a different order than source, so a cycle can pass the source suite and break in dist mode, or the reverse. Per-domain `index.ts` barrels make domain-level cycles easy to create. Proposal, keeping "no enforcement": `engrenage structure` lists domain-level cycles as information, never failing.
- **Bundler aliases in `src` break Node-run consumers** (#148). Node ignores tsconfig `paths`. If a custom `src` set uses bundler aliases and `bin`, `scripts` or a tooling config file runs under Node and imports `src`, those imports fail at runtime. Engrenage's own `node bin/engrenage/index.ts` is such a consumer. Proposal: bundler aliases are allowed only in environments declared bundler-only, and `engrenage sync` fails otherwise.
- **Layer and privacy enforcement is unverified** (#138, #150). The plan relies on eslint-plugin-boundaries v7 expressing:
  - per-layer allow lists;
  - namespaces and layers at any depth;
  - private sub-domains;
  - public roles importable module by module while other roles stay behind `index.ts`.

  #138's prototype (step 1) is still to run. If it falls short, the fallback is an engrenage convention over the resolved structure.

- **Test variants need every test glob updated** (#155):
  - `defaultTestsFiles` (`src/config/constants.ts`) is `**/*.{test,spec}.{ts,tsx}`, so `noMisplacedTests` and every test-file set miss `x.test.src.ts` and `x.test.dist.ts` until it lists them.
  - `x.dist.test.ts` matches Vitest's default and runs in both modes, so the tests role contract must accept only the three suffix forms.
  - Variant files must stay out of coverage.
  - Recommendation: variants on `.test` only, and drop `.spec`, which nothing in the repository uses.
- **#156 needs the description implemented** (#137, #156). The report resolves the structure through `project/structure`, which exists only once a migration task implements the description's resolution. Moving #156 before the migration therefore makes that implementation the first migration task, with #156 right after it. Recommendation: when the migration tasks are created, the first one implements the description's resolution, and #156 lists it as a prerequisite.
- **Default roles leave impure code homeless** (#142, #148). With no default operations role and modules outside roles forbidden, a `strict` project adopting the defaults fails on every impure module until it defines a role. Proposal: `engrenage init` asks for the role name, and the structure report's message names the fix.

## 4. Out of scope here

- The first scratchpad note (canonical `ES2023.Array` casing for TypeScript libs) is not about structure; it stays in the scratchpad for triage.
- Type-only tests (`x.test.types.ts`): "not now". When they come, Vitest's own convention is `x.test-d.ts` (verified: its typecheck mode lists it by default); `x.test.types.ts` would need a custom `typecheck.include`.
- Colocated tests.
