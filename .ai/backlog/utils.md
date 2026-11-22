# utils

Shared helpers and their placement.

## 1. No helper re-throws an error with a better message and its cause.

- why: wrapping a call in try-catch to re-throw with context is repeated across the codebase (for example `parseJson`, `writeJsonValue`, `resolveBinary`, `parseInstruction`, `syncChangesetConfig`), each time as `throw new Error(message, { cause: error })`. Candidate forms: (1) `wrap(fn, errorFactory)` runs a nullary callback and throws `errorFactory(error)` on failure, returning the callback's result; (2) `wrap(error, message, ErrorClass?)` used only inside the catch block builds the new error from the message and an optional error constructor, and whether it returns or throws is an open design decision. Open: first, whether the need and benefits justify a helper at all, weighed against the existing explicit pattern; then whether it belongs in engrenage or upstream in `@auaust/toolkit`.
- want: a decision on need and placement, then the helper if justified, with call sites migrated.
- done: the helper exists and replaces the repeated pattern, or the decision not to add one is recorded and the entry removed.

## 2. Tag and role presets each define the same preset factory.

- why: `createTagPreset` (`src/project/docs/utils/createTagPreset.ts`) and `createRolePreset` (`src/batiment/roles/utils/createRolePreset.ts`) are one generic `(defaults: T) => (options?: Partial<T>) => T` that freezes the merge; a third preset family would copy it again.
- want: one generic preset factory in the lowest domain both import, the two public names kept as typed aliases or replaced, decided with their `@experimental`/public status.
- done: one implementation remains, or keeping two is recorded as intended.

## 3. Markdown utilities each repeat the parser options

- sites: `src/foundation/markdown/utils/listCodeRanges.ts:9`
- why: a shared `parseMarkdown` would join the public barrel, and a `constants.ts` value must be deeply readonly, which the parser's option types reject.
- want: one parser setup the four utilities share.

## 4. Shell parser types are trusted or flattened

- sites: `src/foundation/shell/operations/parseShell.ts:45`, `src/foundation/shell/types/ShellRedirect.ts:4`
- why: `createRequire` returns `any`, so `sh-syntax/sync` is trusted to match its declarations; a redirect `operator` is source text, so comparing it to `<` misses an explicit `0<`.
- want: the module validated or typed by import; a typed operator and descriptor.

## 5. The shell parser reads brace expansions and tildes as literal words

- sites: `src/foundation/shell/operations/parseShell.ts:108`
- why: `readLiteral` keeps an unquoted `{770,731}`, `{1..3}` or `~/x` as one literal, though Bash expands it, so `gh issue view {770,731}` or `for n in {770,731}` yields a wrong literal instead of its words or an expansion.
- want: such words expanded to their words, or kept an expansion.

## 6. The shell parser leaks sh-syntax's error for zsh-only syntax

- sites: `src/foundation/shell/operations/parseShell.ts:430`, `src/tools/agents/operations/findShellTrap.ts:90`
- why: zsh-only syntax (`${(f)x}`) throws sh-syntax's `ShSyntaxError` (code `SH_SYNTAX_LANGUAGE`, no position), not `ShellSyntaxError`, so the git hook check crashes and fails open on `git … ${(f)x}`.
- want: a `ShellSyntaxError` for it, or a distinct error telling zsh-valid commands apart from invalid ones; consumers choose deny or pass.
