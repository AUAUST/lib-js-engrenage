# coding-style

Local coding conventions and linting.

## 1. Type casts remain in source.

- why: `AGENTS.md` forbids casts and assertions without a supported invariant, and none of these carries a marker or a justification: `scripts/codegen/generateEditions.ts` (`esInterfaceAliases` and `esMemberCompatKeys` cast `as Record<string, string | undefined>`, lines 299 and 321), `src/project/config/utils/createAccessors.ts` (`as unknown as Accessors<Fields>`), `src/tools/eslint/conventions/imports/noExternalNamespace.ts` (`context as unknown as ImportContext`), `src/tools/eslint/conventions/structure/importEffects.ts` (untyped ESTree-to-TS node map: `as TsNode`, `as never`).
- want: each site typed without the cast (for example a lookup helper over a frozen table, a typed accessor factory) or marked with `@debt` stating the invariant it depends on.
- done: each site is cast-free or carries a `@debt` marker.

## 2. ESLint convention internals have local gaps

- sites: `src/tools/eslint/conventions/stylistic/naming.ts:27` (splits words by hand; primitive-kit `splitWords`), `preferValuedReturn.ts:142` (fix hardcodes two-space indent), `src/tools/eslint/constants.ts:203` (index role key repeats the one in `project/structure`; needs a shared home: decision).
- want: fix the first two directly; place the key.

## 3. Comments explain code instead of naming it

- sites: `src/workflows/registry/config/schemas/configDeclaration.ts:24` (`Core`, `Tooling`, `Environments`), `tests/utils/binaryTimeout.ts:1`.
- want: names carry the meaning; comments removed.
