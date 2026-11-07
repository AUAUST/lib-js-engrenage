---
"@auaust/engrenage": minor
---

- **Breaking**: Give each environment only the roles it lists in `roles`, built from presets (`src: { roles: [index(), entry(), utils({ nesting: 1 })] }`). Upgrade: add the `roles` of `src`, `tests`, `scripts` and `tooling` to `engrenage.config.ts`, with `entry()` when published; `engrenage init` writes them for new projects.
- **Breaking**: Make a domain public by its `entry.ts` (the renamable `entry` role), which re-exports the public subset of its `index.ts`; the root package entry is `src/entry.ts`. Upgrade: move each public domain's exports into an `entry.ts`.
- **Breaking**: Scope ESLint, `prettier:all` and the `tooling` environment to the declared environments instead of `**`, `tooling` defaulting to the root config files and `tooling/`. Upgrade: declare any other directory to keep it checked.
- Describe the structure per environment (`namespaces`, `domains`, `optOut`, `strictness`), exposed as `structureSection` with its import rules as `importRulesSection`
- Add the `@auaust/engrenage/roles` entry with `createRolePreset` and the presets `index`, `entry`, `constants`, `declarations`, `types`, `utils`, `errors`, `enums`, `ports`, `adapters`, `fixtures`, `setup`, `schemas`, `components`, `hooks`, `contexts`, `pages` and `styles`, each call overriding any default (nested `roles`, `aliases`, the `constants` and `index` file names)
- Add the role field `effects` and `structure.effects` (`levels`, `modules`, `fallback`): a ranked module imports at runtime only from roles and modules of its level or purer (`pure`, `confined`, `effectful`); `utils/` is confined and may import other domains' `utils/` through their `index.ts`
- Add the role field `typeOnly` (on for `types` and `ports`): such modules declare no runtime value and import anything their domain may, type-only
- Add the role property `rules`: ESLint rule entries applied to the role's own files
- Add the role options `strict`, `required` and `unique`: only the files nested roles name at the role's root, at least one, at most one file per owning location
- Classify files at a role's root that a nested role's `file` globs match with that nested role, `file` accepting a callback over the owning location and `fileDescription` for maps
- Treat a file named like the index file as an ordinary module in a role with `index` off
- Make `constants` a public role peers and lower layers may import
- Let `tooling` import `src` like `scripts` does, never `bin`, `scripts`, `data/` or `tests`
- Add `aliases`, `src.aliases` and `src.bundled`; `engrenage sync aliases` generates `package.json#imports` and the bundled tsconfig `paths`, and `src.bundled` sets the src tsconfig `module` and `moduleResolution`
- Add `engrenage structure`, printing each directory's classification, each role's effect level and runtime import cycles; `--check` fails on unclassified directories of strict environments, cycles and broken `required` or `unique` roles, type-only imports never counting toward a cycle
- Fix tests mirror directories read as the role their name matches
