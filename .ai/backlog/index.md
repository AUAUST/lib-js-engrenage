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
- State the matter, relevant context, expected outcome and completion or obsolescence condition. Field labels and proposed fixes are optional.
- Update existing entries instead of duplicating them. Remove resolved or obsolete entries; delete empty categories and their index links.

## Open categories

- [coding-style](coding-style.md): Coding style conventions, ESLint behavior and linting gaps.
- [pnpm](pnpm.md): pnpm workspace setup and synchronization.
- [primitive-kit](primitive-kit.md): Upstream @auaust/primitive-kit types and missing helpers.
- [json-schema-to-typescript-lite](json-schema-to-typescript-lite.md): Upstream schema compilation issues reached through eslint-typegen.
- [c12](c12.md): Upstream c12 configuration loader issues.
- [eslint-import-context](eslint-import-context.md): Upstream eslint-import-context dependency and type issues.
- [eslint](eslint.md): Upstream ESLint API limitations.
- [configuration](configuration.md): Configuration ownership, project roots and refresh lifecycles.
- [agent-instructions](agent-instructions.md): Agent instruction resolution and synchronization.
- [vscode](vscode.md): VS Code project settings and synchronization.
