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
