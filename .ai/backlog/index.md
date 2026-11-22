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

- Add an entry with `pnpm metalbrain backlog add <category> "<title>"`, then write its bullets under the heading it adds; move one by adding it to its new category, removing the old one and updating references to it.
- Cite an entry by the ID its heading holds, only within this repository.
- Write the title as the claim: the problem or need, stated exactly.
- Follow it with keyword bullets: `sites` (each code site as `file:line`, when the work has any), then at most three of `why` (context), `want` (expected outcome), `done` (completion or obsolescence condition). Drop a bullet the title already states.
- Update existing entries instead of duplicating them. Remove resolved or obsolete entries; delete empty categories and their index links.
- Once a GitHub issue tracks an entry's work, remove the entry, or reduce it to the work the issue leaves here and link the issue.

<!-- @end -->

## Open categories

- [c12](c12.md): Upstream c12 configuration loader issues.
- [claude-code](claude-code.md): Upstream Claude Code harness behavior.
- [eslint-import-context](eslint-import-context.md): Upstream eslint-import-context dependency and type issues.
- [eslint](eslint.md): Upstream ESLint API limitations.
- [toolkit](toolkit.md): Upstream @auaust/toolkit decisions that may affect engrenage.
- [configuration](configuration.md): Project configuration contract: loading, environments, option shapes and list options.
- [typescript](typescript.md): Generated tsconfigs: checks, variant resolution and shipped type declarations.
- [tsdown](tsdown.md): Generated tsdown build configuration: entries, outputs and declaration files.
- [package-json](package-json.md): Published package contents and fields derived by the sync `package` target.
- [file-editing](file-editing.md): In-memory editing of JSON and YAML files in the codegen tooling.
- [readme](readme.md): Project README content, deferred until the API stops breaking at every release.
- [coding-style](coding-style.md): Local coding conventions and linting.
- [utils](utils.md): Shared helpers and their placement.
- [vitest](vitest.md): Generated Vitest configuration.
- [structure](structure.md): Project structure description, its report and the tooling generated from it.
- [changesets](changesets.md): Changesets configuration and presets.
- [github](github.md): Generated GitHub workflows and templates.
- [agent-instructions](agent-instructions.md): Shared agent instructions, skills and backlog conventions.
- [gate](gate.md): The commit gate and its process locks.
- [processes](processes.md): Spawned processes, binary and module resolution.
- [extensions](extensions.md): The extension registry and extension declarations.
- [cli](cli.md): Command definitions, registration and program runs.
- [tests](tests.md): Test infrastructure and coverage gaps.
- [format](format.md): The `format` section, formatter selection and formatting vocabulary.
- [prettier](prettier.md): The Prettier tool domain: layout plugin, layout conventions and formatting runs.
- [filesystem](filesystem.md): The filesystem abstraction, globbing and glob anchoring.
- [git](git.md): The Git tool domain: repository layout, commit reading and Git-owned ignore globs.
- [agents](agents.md): Agent runtime integrations: hooks, runtime names and skill rendering.
- [vscode](vscode.md): Synced VS Code files.
- [lefthook](lefthook.md): Lefthook integration.
- [pnpm](pnpm.md): pnpm integration and package-manager scripts.
- [init](init.md): Init steps and their step context.
- [sync](sync.md): `project/sync` target ordering and sync products.
- [eslint-conventions](eslint-conventions.md): ESLint rules and conventions engrenage ships.
- [docs](docs.md): Doc tag declarations and the readers of tagged source.
- [issues](issues.md): GitHub issue drafts, checks and planning commands.
- [spec-migration](spec-migration.md): Breakage the #809 spec-leaf migration knowingly causes, until handled.
