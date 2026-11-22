# Backlog

<!-- @reference @auaust/engrenage/metalbrain/templates/backlog.md -->

Deferred questions, bugs, tasks and improvements.

## Categories

- Categorize by the dependency family or project subsystem that must change, not by symptom, urgency or entry type.
- Upstream work belongs to its dependency's product family. Packages forming one tool share a category: `@changesets/cli` and `@changesets/core`. Separate products stay separate: Vite/Vitest and `@auaust/toolkit`. A shared vendor or integration does not define a family.
- Local coding conventions and linting belong to `coding-style`. Other local work belongs to the project subsystem whose behavior or contract must change.
- Reuse the category owning that dependency family or subsystem. If none exists, create it without asking, even for one entry, with `pnpm metalbrain backlog create <owner> "<purpose>"`, the purpose naming the product or behavior it owns. No categories are required in advance.
- Read only the categories whose purpose matches.

## Entries

- Add an entry with `pnpm metalbrain backlog add <category> "<title>"`, then fill in the entry it adds; move one by adding it to its new category, removing the old one and updating references to it.
- Cite an entry by its `id`, only within this repository.
- Write the title as the claim: the problem or need, stated exactly.
- Follow it with `sites` (each code site as `<path>:<line>`, when the work has any), then at most three items across `why` (context), `want` (expected outcome) and `done` (completion or obsolescence condition), each a text or a list. Drop a key the title already states.
- Update existing entries instead of duplicating them. Remove resolved or obsolete entries; delete empty categories.
- Once a GitHub issue tracks an entry's work, remove the entry, or reduce it to the work the issue leaves here and link the issue.

<!-- @end -->

## Open categories

- [agent-instructions](agent-instructions.yml): Shared agent instructions, skills and the backlog conventions.
- [agents](agents.yml): Agent runtime integrations: hooks, runtime names and skill rendering.
- [c12](c12.yml): Upstream c12 configuration loader issues.
- [changesets](changesets.yml): Changesets configuration and presets.
- [claude-code](claude-code.yml): Upstream Claude Code harness behavior.
- [cli](cli.yml): Command definitions, registration and program runs.
- [coding-style](coding-style.yml): Local coding conventions and linting.
- [configuration](configuration.yml): Project configuration contract: loading, environments, option shapes and list options.
- [docs](docs.yml): `project/docs`: doc tag declarations and the readers of tagged source.
- [eslint-conventions](eslint-conventions.yml): ESLint rules and conventions engrenage ships.
- [eslint-import-context](eslint-import-context.yml): Upstream eslint-import-context dependency and type issues.
- [eslint](eslint.yml): Upstream ESLint API limitations.
- [extensions](extensions.yml): The extension registry and extension declarations.
- [file-editing](file-editing.yml): In-memory editing of JSON and YAML files in the codegen tooling.
- [filesystem](filesystem.yml): The filesystem abstraction, globbing and glob anchoring.
- [format](format.yml): The `format` section, formatter selection and formatting vocabulary.
- [gate](gate.yml): The commit gate and its process locks.
- [git](git.yml): The Git tool domain: repository layout, commit reading and Git-owned ignore globs.
- [github](github.yml): Generated GitHub workflows and templates.
- [init](init.yml): Init steps and their step context.
- [issues](issues.yml): GitHub issue drafts, checks and planning commands.
- [lefthook](lefthook.yml): Lefthook integration.
- [package-json](package-json.yml): Published package contents and the `package.json` fields derived by the sync `package` target.
- [pnpm](pnpm.yml): pnpm integration and package-manager scripts.
- [prettier](prettier.yml): The Prettier tool domain: layout plugin, layout conventions and formatting runs.
- [processes](processes.yml): Spawned processes, binary and module resolution.
- [readme](readme.yml): Project README content, deferred until the API stops breaking at every release.
- [spec-migration](spec-migration.yml): Breakage the #809 spec-leaf migration knowingly causes (S.18): what is expected to break and what must be handled before walks resume.
- [structure](structure.yml): Project structure description, its report and the tooling generated from it.
- [sync](sync.yml): `project/sync` target ordering and sync products.
- [tests](tests.yml): Test infrastructure and coverage gaps.
- [toolkit](toolkit.yml): Upstream @auaust/toolkit decisions that may affect engrenage.
- [tsdown](tsdown.yml): Generated tsdown build configuration: entries, outputs and declaration files.
- [typescript](typescript.yml): Generated tsconfigs: checks, variant resolution and shipped type declarations.
- [utils](utils.yml): Shared helpers and their placement.
- [vitest](vitest.yml): Generated Vitest configuration.
- [vscode](vscode.yml): Synced VS Code files.
