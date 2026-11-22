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

- Add an entry with `pnpm metalbrain backlog add <category> "<title>"`, filling the keys below with `--sites`, `--why`, `--want` and `--done`, each repeated for a list: it prints the new ID and writes nothing when the entry breaks the schema. Move one by adding it to its new category, removing the old one and updating references to it.
- Cite an entry by its `id`, only within this repository.
- Write the title as the claim: the problem or need, stated exactly.
- Follow it with `sites` (each code site as `<path>:<line>`, when the work has any), then at most three items across `why` (context), `want` (expected outcome) and `done` (completion or obsolescence condition), each a text or a list. Drop a key the title already states.
- Update existing entries instead of duplicating them. Remove resolved or obsolete entries; delete empty categories.
- Once a GitHub issue tracks an entry's work, remove the entry, or reduce it to the work the issue leaves here and link the issue.

<!-- @end -->
