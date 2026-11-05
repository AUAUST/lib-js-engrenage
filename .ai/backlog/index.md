# Backlog

Deferred questions, bugs, tasks and improvements.

## Categories

- Categorize by the dependency family or project subsystem that must change, not by symptom, urgency or entry type.
- Upstream work belongs to its dependency's product family. Packages forming one tool share a category: `@changesets/cli` and `@changesets/core`. Separate products stay separate: Vite/Vitest and `@auaust/toolkit`/`@auaust/primitive-kit`. A shared vendor or integration does not define a family.
- Local coding conventions and linting belong to `coding-style`. Other local work belongs to the project subsystem whose behavior or contract must change.
- Reuse the category owning that dependency family or subsystem. If none exists, create `<owner>.md` without asking, even for one entry. No categories are required in advance.
- Index each category with a link and its owned product or behavior. Read only matching categories.

## Entries

- Use headings `## N. Title`, numbered consecutively from 1 within each category. The ID is `<filename without .md>.N`, for example `primitive-kit.1`.
- After adding, removing or moving entries, renumber affected categories and update entry references.
- Write the title as the claim: the problem or need, stated exactly.
- Follow it with at most three keyword bullets: `why` (context), `want` (expected outcome), `done` (completion or obsolescence condition). Drop a bullet the title already states.
- Update existing entries instead of duplicating them. Remove resolved or obsolete entries; delete empty categories and their index links.
- Once a GitHub issue tracks an entry's work, remove the entry, or reduce it to the work the issue leaves here and link the issue.

## Open categories

- [primitive-kit](primitive-kit.md): Upstream @auaust/primitive-kit types and missing helpers.
- [c12](c12.md): Upstream c12 configuration loader issues.
- [eslint-import-context](eslint-import-context.md): Upstream eslint-import-context dependency and type issues.
- [eslint](eslint.md): Upstream ESLint API limitations.
- [toolkit](toolkit.md): Upstream @auaust/toolkit decisions that may affect engrenage.
- [configuration](configuration.md): Project configuration contract: environments, option shapes and list options.
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
- [format](format.md): Formatting conventions of `project/format` and the tools they map to.
- [github](github.md): Generated GitHub workflows and templates.
- [agent-instructions](agent-instructions.md): Shared agent instructions, skills and backlog conventions.
