# format

The `format` section, formatter selection and formatting vocabulary.

## 1. Format section scope and reach

- sites: `src/project/format/constants.ts:24`, `src/project/format/operations/formatContent.ts:5`, `src/project/sync/operations/formatChanges.ts:24`, `src/foundation/json/types/JsonIndentation.ts:1`, `src/project/format/config/schemas/formatSchema.ts:47`
- why: JSON has no tool domain at the conventions boundary, so it ignores `format`; callers pass the formatter though `format.formatter` selects one; synced files use the project's formatter even when the git filesystem sits above the root; `insertSpaces`/`tabSize` duplicate `indent`; complexity limits sit in the formatting section.
- want: formatter selected from config; `format` applied to JSON; one vocabulary; complexity limits in a section on how code is written (planning).
