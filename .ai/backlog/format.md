# Format

## 1. Formatting conventions Prettier cannot express have no target

- why: `project/format` conventions (#180) map only to Prettier and JSON edits; Prettier has no final-newline option.
- want: a `finalNewline` convention, mapped to `insert_final_newline` in a generated `.editorconfig`, with other conventions mapped there too.
- done: `.editorconfig` is generated from the conventions.

## 2. `formatContent` needs its formatter passed by every caller

- site: `src/project/format/operations/formatContent.ts:5`
- why: `project` cannot import `tools`, so the Prettier adapter is not bound.
- want: decide where the adapter is bound (planning).
