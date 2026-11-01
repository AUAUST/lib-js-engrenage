# Scratchpad

===

createTsconfigStep.ts still writes the baseline into extends, which sync immediately removes.

===

createDistTsconfigStep.ts still references library.dist.json.

===

pnpm engrenage sync --check still reports drift in this repo’s own tsconfigs. The repo isn’t adopting the new layout yet, and the other producers (target, lib, types, base references) belong to the other sub-issues.

===

The config valibot schema should be used to generate a config interface with documentation comments for each field.
Right now, the config types are directly typed as infered schema types which means that peaking at the type definitions opens the source schema itself, and doesn't include any documentation comments for each field.
There could be two ways: either there's a way to include documentation comments directly in the valibot schema, or we find a way to extract jsdocs next to each field in the generated config interface.
I'd expect valibot to already have a "schema-to-interface" codegen tool, so we won't want to implement it ourselves.

===

The codegen library should have a sort of filesystem abstration that allows having "virtualized" files for JSON/Yaml content.
The idea is that we can open some files as virtualized, manipulate their content in memory, and then write them back to the actual filesystem if needed (or diff them) without the serialization/deserialization overhead.
The idea is to enable larger step-by-step operations to be performed on the virtualized files in memory; in our current tooling where we have to read and write package.json, tsconfig and such repeatedly, but where each step typically changes only a small portion of the file content, this makes the thing straightforward and efficient. We can easily have our file opened once, edited efficiently in memory through path-based accessors, and then written back only when necessary. This abstraction would significantly reduce I/O overhead, and should be responsible for managing the consistency of files. I.e. opening a file to set only one field should not reformat the entire file but instead only change the key; same order, same formatting, and minimal changes should be preserved.

===

The current repo's presets are rather complicated to work with. Lots of places have to manually write checks and perform guesswork based on the presets to try to insert dynamic defaults. We'll want to have a better way to define and apply these presets, ideally with a more declarative approach.

Maybe we could do that by having a sort of "config factory" for config options that take in the presets as arguments. Instead of manually checking and applying defaults throughout the codebase, we could centralize this logic in the factory, making it easier to maintain and reason about. Opening a factory clearly shows that "ok, so we can see that including X presets will do Y to Z option".

The "abstracted file" described above could have the concept roughly applied to the init script as well. This way, we'd essentially have a "config state" that's initialized with the default-defaults, then selecting presets would update these defaults with preset-defaults, and from there the init script would continue editting the config state with explicit user input. By the end of it, we have a whole declarative representation of the final configuration, which can be handled once and cleanly by the handler.

===

Bug report for @auaust/toolkit: `empty(value)` when the value is a union with `undefined` does not exclude `undefined` from the guard apparently. With this code:

```ts
const value = [] as string[] | undefined;

if (!empty(value)) {
  // Here, we expect the value to be `string[]` (or, more specifically, something like `[string, ...string[]]`)
  // Instead, we get that:
  // empty<string[] | undefined>(input: string[] | undefined): input is (string[] & []) | undefined
}
```

===

@auaust/toolkit should have a regex domain that exposes a `RegExp.escape` method available until `ES2025` becomes a widely available standard.

===

Add a todo for engrenage to undo the `node: 24` config once the above escape is available. This way, engrenage will go back to relying on its own defaults.

===

The synced GitHub labels should include more specific categories. We should also try to use the new custom fields, i.e. the "priority" field to have `Type: Bug` + `Priority: High | Medium | Low` instead of the current `Bug: High | Medium | Low` labels. We should have labels for our "Plan" issues (parent/root), "Block" issues (groups of tasks) and "Task" issues (individual actionable items). We should also improve the dependency between issues. I.e. bugs should never be part of a plan directly (we don't plan a bug; we log them for fix and they all exist as root), but we can assign a bug issue as a blocking dependency to tasks.

===

Limitation: engrenage sync refreshes the body of installed skills and rules but not their frontmatter. We should consider adding support for syncing the frontmatter as well, or logging/warning when there are discrepancies between the local and remote frontmatter.

===

We should see if we can create issue templates to easily open new plan/block/task issues, automatically filling the relevant fields and linking to the appropriate parent or blocking issues.

===

Build fails with:

Error: [rolldown-plugin-dts] Unable to load /Users/aurianaubert/Desktop/AUAUST/libraries/javascript/engrenage.nosync/src/agents/claude/constants.ts; You have "references" in your tsconfig file. Perhaps you want to add `dts: { build: true }` in your config?

We'll want to ensure that the solution tsconfig we're using and its handling over all tooling is appropriate.

-> ensure that typechecks correctly typechecks the necessary entry tsconfigs instead of the solution one
-> ensure that tsdown and vite handle them appropriately, building the bin and source but also likely excluding tests and scripts

The above behaviour is indicative; how each tool must handle solutions tsconfigs and references needs to be carefully coordinated to avoid build and typecheck errors in projects.
