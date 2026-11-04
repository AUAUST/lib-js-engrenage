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

## 3. `@auaust/engrenage/prettier` loads the project configuration on import

- why: `src/tools/prettier/index.ts` has `export default definePrettierConfig()` for the package.json `"prettier"` reference, so importing the entry for `definePrettierConfig` loads the config eagerly (`@debt` marker in code). Prettier 3.9 rejects a function default export, so no lazy form exists (#182, closed for now).
- want: a dedicated package entry for the reference, with no default export on the public entry; #197 (entry role as package entry) likely provides it.
- done: after #197 closes, reconsider Prettier's setup and check whether the eager load still causes problems; otherwise remove the entry and the marker.
