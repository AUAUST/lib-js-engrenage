# coding-style

Local coding conventions and linting.

## 1. ESLint needs a custom exclusion for `data/**` and lints files outside the root config's paths.

- why: it fails on `data/` because no tsconfig includes its files, so `eslint.config.ts` carries `ignores: ["data/apis/**"]`. This reveals a broader issue: ESLint should not try to lint files that no tsconfig path of the root config includes.
- want: the generated ESLint config derives what it lints from the paths the project's tsconfigs include, so no manual exclusion is needed.
- done: `eslint.config.ts` needs no `data` exclusion and files outside the configured paths are not linted.

## 2. Type casts remain in source.

- why: `AGENTS.md` forbids casts and assertions without a supported invariant, and none of these carries a marker or a justification: `scripts/codegen/generateEditions.ts` (`esInterfaceAliases` and `esMemberCompatKeys` cast `as Record<string, string | undefined>`, lines 299 and 321), `src/project/config/utils/createAccessors.ts` (`as unknown as Accessors<Fields>`), `src/tools/eslint/conventions/imports/noExternalNamespace.ts` (`context as unknown as ImportContext`).
- want: each site typed without the cast (for example a lookup helper over a frozen table, a typed accessor factory) or marked with `@debt` stating the invariant it depends on.
- done: each site is cast-free or carries a `@debt` marker.
