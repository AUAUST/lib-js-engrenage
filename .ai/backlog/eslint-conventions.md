# eslint-conventions

ESLint rules and conventions engrenage ships.

## 1. Lint rules type their nodes by cast

- sites: `src/tools/eslint/conventions/stylistic/noReturnUndefined.ts:67`, `preferValuedReturn.ts:106`, `src/tools/eslint/conventions/structure/importEffects.ts:183`, `src/tools/eslint/conventions/imports/noExternalNamespace.ts:37`, `src/tools/eslint/operations/resolveConventionSections.ts:48`, `src/tools/eslint/types/ConventionSections.ts:3`
- why: rules typed against core ESTree nodes, so TS fields are probed with `in`; listeners widened to `Rule.Node`; ESTree-to-TS map cast `as TsNode`/`as never`; `context as unknown as ImportContext`; the sections record asserted; config key `sections` is a leftover name.
- want: typed typescript-eslint listeners; a typed record mapper; the key renamed.

## 2. ESLint rules check less than they should

- sites: `src/tools/eslint/conventions/imports/noPointlessDynamicImport.ts:17`, `structure/importEffects.ts:199`, `structure/importSpecifiers.ts:33`, `:45`, `structure/roleExports.ts:19`, `src/tools/eslint/config/schemas/optionsSchema.ts:14`
- why: dynamic-import rule sees direct imports only; bare side-effect imports take the highest binding level (#315); the specifier check lives outside `project/structure`, and an unknown path may postdate the index; `bin` has no lint scope; the schema accepts unknown convention names.
- want: rule walks the static graph; specifier check in `project/structure`, index refreshed on unknown paths; `bin` checked; unknown names rejected.

## 3. ESLint plugin and analysis hold on unchecked inputs

- sites: `src/tools/eslint/utils/analyzeImports.ts:15`, `:34`, `createPlugin.ts:29`, `defineBoundaryRule.ts:86`, `src/tools/eslint/conventions/stylistic/preferValuedReturn.ts:142`
- why: `analyzeImports` is keyed by the entity index alone; it forces the importer's extension on targets (`.json`, `.tsx` wrong); a disabled convention reading sections registers no rule; a boundary in another environment renders as `../src/…`; the fix hardcodes a two-space indent.
- want: inputs tied to one loaded config; target extensions from the target; disabled conventions reported; indent from the source.

## 4. `readonly-constants` forces schemas to `StandardSchemaV1`, erasing output types

- sites: `src/project/build/constants.ts:10`, `src/project/environments/constants.ts:75`, `:88`, `src/project/format/constants.ts:30`, `src/project/presets/constants.ts:15`, `src/project/roles/constants.ts:30`, `src/project/sync/constants.ts:11`, `:21`, `src/tools/agents/constants.ts:30`, `src/workflows/gate/constants.ts:8`
- want: a readonly-constants form keeping the schema's output type (planning: the rule is shared).

## 5. The naming rule splits words by hand

- site: `src/tools/eslint/conventions/stylistic/naming.ts:27`
- want: primitive-kit `splitWords`.

## 6. `projectService` spends ~5 s of a full lint matching files to tsconfigs

- site: `src/tools/eslint/utils/createTypeAwareLanguageOptions.ts`
- why: TypeScript's `isMatchedByConfig` scans every solution reference's file names per opened file, quadratic in project size; per-environment `parserOptions.project` cut a full lint from 30.5 s to 23.9 s.
- want: per-environment `project` (against typescript-eslint's recommendation), or an upstream TypeScript fix (question).
