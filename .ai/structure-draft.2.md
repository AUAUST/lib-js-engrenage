# Structure draft 2: open items (plan #137)

Your answers (scratchpad, fifth round) are merged into `structure-draft.1.md` and the issues. Three points remain open; each is also in the **Questions** section of its issue, which carries the "Information required" label until it is answered. Everything else in the tree is ready.

## 1. Questions

### Unique presets and a traits option (#153)

You suggested at most one base preset defining every relevant trait, with traits as a managed list option that adds, removes or overrides them, and noted that overriding barely makes sense combined with a preset.

- Today `presets` is a list (only `library` exists), and the plan also has environment-level presets.
- Traits make environment presets redundant: an environment reads the project's traits.
- Options:
  - (a) Keep a list of presets, composed, with no `traits` option.
  - (b) One optional `preset`, plus `traits: { enable, disable }` applied after it, with known, type-safe keys like `roles`. No environment presets.
  - (c) As (b), but `traits` replaces the preset entirely when given.
- Recommendation: (b).
  - A combination of presets is where hidden interactions come from, and traits cover the combinations a preset misses.
  - `enable` and `disable` keep the preset meaningful while adjusting it, which removes the "override doesn't fit with a preset" problem.
  - It mirrors the `roles` option.

### Scope of nested roles (#142)

You asked how a structured role declares roles that exist only inside it (`gql/` → `queries/`, `mutations/`, `fragments/`), and noted the same need for an app's `ui/`, which holds UI-only roles.

- (a) **Definition split from activation.** Every role is defined once in `roles.define`, by name. A role marked `scoped: true` is active only where a scope enables it. Two things enable it: a structured role's `roles: [...]` list, and a namespace's `roles: { enable }`, which applies to its whole subtree. `ui/` becomes a namespace enabling `components/`, `hooks/` and `contexts/` for the domains inside it.
- (b) **Inline definitions.** A structured role's `roles` lists known role names or inline role objects; the inline ones exist only there. `ui/` becomes a structured role.
- Recommendation: (a).
  - One definition mechanism and one activation mechanism, at every level (project, environment, namespace, structured role).
  - Roles stay reusable across scopes (`schemas/` inside `gql/` and elsewhere).
  - It handles `ui/` as a namespace, so UI code keeps domains (one per feature) instead of collapsing into a single role directory.

### `ports/` and `adapters/`: default or off? (#142)

Last round you made them **default** ("unlikely the names will ever be used for another purpose"). This round, on the off-by-default list, you wrote "add ports and adapters".

- Draft 1 keeps them default.
- Options: (a) keep them on by default, so your note only confirms they ship; (b) move them to the off-by-default list, enabled by presets or projects.
- Recommendation: (a), per your criterion.

## 2. Decided in this round without asking (correct if wrong)

- **Port components** (#142). A port's component types stay in `types/`, and other domains import them through the domain's `index.ts`. That is the domain's normal surface, so `types/` stays private and the port exports only its contract type.
- **Bundler aliases** (#159). A new `src` environment option, `bundled`, declares that its code only runs through a bundler. Bundler aliases are allowed only then, written once into the root tsconfig `paths` and inherited by every environment.
- **Engrenage's own aliases** (#159). Its four namespaces declare an empty prefix, so domains keep `#tsdown/…`, `#config/…`. The existing `#package.json` becomes a custom global alias.
- **Interim checks.** #155 and #159 land before traits exist. They read the `library` preset, marked `@debt` toward the `published` trait.
- **Tree.** The roles (#142), the description (#148), then the report (#156) and the aliases (#159) come before the relocation (#139), so the report checks the relocation and sync regenerates its aliases. #140 is now the block of #156 and #159. New issues: #159 (aliases), #160 (engrenage touches only declared environments), #161 (block: public API and workspaces). Discussion issues are rewritten as implementation tasks.
- **Alias options** (#159): `aliases: false | { generated?, define? }` at the top level and the same shape in `src.aliases`. `false` turns a set off; `generated: false` with `define` replaces it; `define` alone adds to it.
- **Clean policy** (#160): `"all"` (default), `"emitted"` (files recorded in a manifest by the previous build) or `false`. GitHub workflows become `engrenage-<name>.yml`, and sync removes an unprefixed workflow it wrote before only when its content is unchanged.
- **Public specifiers** (#154): a public domain's default specifier is its path without namespaces (`tools/tsdown` → `./tsdown`); `src.exports` overrides it; duplicates fail.
- **Backlog.** Removed the entries the tree now tracks: `source-structure.1`–`.8`, `configuration.2`, `.4`–`.7`, `agent-instructions.4`, `vitest.1`. Added deferred work: host presets (`configuration.3`), `engrenage structure --json` (`structure.1`), type-only tests (`vitest.1`), colocated tests (`vitest.2`).
