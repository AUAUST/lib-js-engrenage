# coding-style

Local coding conventions and linting.

## 1. Type casts remain in source.

- why: `AGENTS.md` forbids casts and assertions without a supported invariant, and none of these carries a marker or a justification: `scripts/codegen/generateEditions.ts` (`esInterfaceAliases` and `esMemberCompatKeys` cast `as Record<string, string | undefined>`, lines 299 and 321), `src/project/config/utils/createAccessors.ts` (`as unknown as Accessors<Fields>`), `src/tools/eslint/conventions/imports/noExternalNamespace.ts` (`context as unknown as ImportContext`), `src/tools/eslint/conventions/structure/importEffects.ts` (untyped ESTree-to-TS node map: `as TsNode`, `as never`).
- want: each site typed without the cast (for example a lookup helper over a frozen table, a typed accessor factory) or marked with `@debt` stating the invariant it depends on.
- done: each site is cast-free or carries a `@debt` marker.

## 2. Lazy CLI command loading runs under temporary antipatterns.

- why: `auaust/no-dynamic-import` blocks the `import()` calls that load each CLI subcommand on demand; the rule is disabled in the 7 registration files, beside the other workarounds listed in #221, each marked `@debt`. The registration process is ugly in itself. A proper pattern to handle dynamic imports only on the expensive path is needed, while allowing to eagerly load the entire CLI graph upfront.
- done: #221 settles the rule and its markers are resolved.

## 3. Boundary lint messages name the wrong remedy

- why: a `project` module importing `#tools/prettier/index`, or its own domain's `../index`, is told to "import the domain through its index.ts", which it already does; `import-surfaces` lists every grant instead of the broken one; the "never relative paths" rule of the structure section has no lint rule.
- want: one cause and one fix per message (higher layer, own index, relative path), and a lint rule for relative imports.
- done: each boundary message names the broken relation and its fix.

## 4. Lint rules and messages understate or miss what they check

- sites: `src/tools/eslint/conventions/structure/indexDeclarations.ts:31` (`export default <expression>` never inspected), `roleExports.ts:14` (`bin` has no lint scope), `src/tools/eslint/utils/createBoundaryRule.ts:11` (typings describe the default export as the module namespace), `src/project/structure/operations/resolveImportRules.ts:542` (reasons say "through their index.ts" while `surface` also grants public roles). Boundary messages: `coding-style.3`.
- want: each rule checks what its message promises.

## 5. ESLint convention internals have local gaps

- sites: `src/tools/eslint/conventions/stylistic/naming.ts:27` (splits words by hand; primitive-kit `splitWords`), `preferValuedReturn.ts:142` (fix hardcodes two-space indent), `src/tools/eslint/constants.ts:203` (index role key repeats the one in `project/structure`; needs a shared home: decision).
- want: fix the first two directly; place the key.

## 6. Comments explain code instead of naming it

- sites: `src/workflows/registry/config/schemas/configDeclaration.ts:24` (`Core`, `Tooling`, `Environments`), `tests/utils/binaryTimeout.ts:1`.
- want: names carry the meaning; comments removed.

## 7. The ESLint per-file cache lets type-aware rules pass stale files

- site: `bin/engrenage/eslint.ts:12`
- why: a file whose imported types changed keeps passing; checks pass `--no-cache` today. Adjacent: #58.
- want: sound caching or no cache (debugging).
