# Format

## 1. Formatting conventions Prettier cannot express have no target

- why: `project/format` conventions (#180) map only to Prettier and JSON edits; Prettier has no final-newline option.
- want: a `finalNewline` convention, mapped to `insert_final_newline` in a generated `.editorconfig`, with other conventions mapped there too.
- done: `.editorconfig` is generated from the conventions.

## 2. `jsonIndentation` and `JsonIndentation` have no tool-boundary home

- why: `foundation/json` cannot import `project/format`, so `{ insertSpaces, tabSize }` restates `Conventions.indent` and `indentWidth`; JSON has no tool domain, so `jsonIndentation` sits in `src/project/format/constants.ts` and thirteen callers pass it.
- also: JSON written by sync ignores `indent`, `indentWidth` and `endOfLine` of the `format` section.
- want: a `jsonc` adapter or `project/format/utils` mapping, or conventions threaded through the step context.
- done: one vocabulary, mapped once at a boundary; changing `format.indent` changes the JSON sync writes.
