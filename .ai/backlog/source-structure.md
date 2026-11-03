# source-structure

Organization of `src/`: role directories, module boundaries and entry layering.

## 1. `utils/` directories are flat dumps of unrelated roles.

- Where: `src/typescript/utils/` (26 files), `src/config/utils/` (18), `src/eslint/utils/` (16), `src/agents/utils/` (11), `src/tsdown/utils/` (8), `src/utils/`.
- Problem: one directory holds creators (`createTsconfig`), resolvers (`resolveTsconfigOwner`), readers (`readTsconfigValue`), predicates (`isPackageAlias`), sync routines (`syncEditions`, `syncBarrels`), date arithmetic (`addMonths`, `findCurrentMonth`), and parsers, with nothing to tell the categories apart or to find a feature's files. Related files (the `resolveTsconfig*`, `resolveBaseline*` and `*EsLibrar*` families in `typescript`) are only grouped by filename prefix.
- Expected: a documented classification of the module kinds living in `utils/`, then a structure (role directories, feature directories or another grouping) derived from it, informed by how established libraries organize comparable code, and stated in project-agnostic terms for the agent instructions.
- Open: the classification, the grouping criterion and how it fits the `config/`, `setup/`, `plugins/`, `utils/` entry layout in `AGENTS.md`. This needs investigation of reference libraries, then a decision. The investigation should also yield a reusable, project-agnostic approach for structuring complex code.
- Done when the classification and chosen structure are recorded in the instructions and `utils/` directories follow them.

## 2. Entries depend on each other in both directions.

- Where: `src/config/utils/*` imports from `#typescript/` (11 imports), `#agents/` (2), `#tsdown/`, `#prettier/`, `#pnpm/` and `#github/`, while `src/typescript/` imports from `#config/` 43 times (`eslint` 19, `agents` 14, `tsdown` 10 do the same).
- Problem: `config` and `typescript` import each other, and `config` knows every tool, so the layering is circular. For example `createResolvedConfig` calls `#typescript/utils/createTsconfig`, and `resolveTsconfig*` in `config` embeds tsconfig knowledge.
- Expected: a one-way layering where `config` is a base that tools depend on, with tool-specific resolution (tsconfig files, owners, presets) living in the tool's entry and contributed to the config rather than imported by it.
- Open: whether tsconfig handling is its own subsystem or belongs to `typescript`; how tools contribute resolved values to the config without `config` importing them. This needs design.
- Done when no import cycle exists between entries, ideally enforced by a lint rule.

## 3. Confusingly similar module names.

- Where: `src/config/utils/resolveNodeRuntime.ts` (validates a Node major against `node-releases` and builds a `Runtime`) versus `resolveRuntimeNode.ts` (defaults a major from `engines.node`); `resolveSourceRuntime`, `resolveCodeEnvironment` versus `createCodeEnvironment`; private `readLibrary` in both `syncEditions` and `syncApiDeclarations`.
- Problem: the names are word permutations of one another and do not tell what each does, so callers import the wrong one easily.
- Expected: names that state the distinct result of each module, applied consistently with the verb conventions the classification in `source-structure.1` defines.
- Done when no two modules differ only by word order and each name states its result.

## 4. Agent instructions do not name the known patterns the project follows.

- Matter: the conventions and structures in the instructions may map to known, named design patterns or conventions. Naming them could let agents grasp the intended structure with little or no extra explanation.
- Expected: determine which of the project's patterns match a named one and name it in the instructions, in project-agnostic terms. Related to `source-structure.1`, whose classification may adopt such names.
- Open: which patterns match; needs investigation, then a decision.
- Done when the instructions name the matching patterns, or the investigation finds none worth naming.
