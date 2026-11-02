# tsdown

Generated tsdown build configuration: entries, outputs and declaration files.

## 1. tsdown emits declaration files for the bin entry.

- Where: `dist/bin/engrenage.d.mts`, produced by the build from `defineTsdownConfig` (`src/tsdown`).
- Matter: the bin is not a library entry, so its declaration file is useless to consumers and ships in the package.
- Expected: the build emits no declaration files for the bin entry.
- Done when a build leaves no `.d.mts` under `dist/bin/` while library entries keep theirs.

## 2. Namespace re-exports lose their entry's identity in the compiled output.

- Matter: this test passes against the source and fails against the compiled output:
  ```ts
  import { object as rootObject } from "@auaust/toolkit";
  import * as object from "@auaust/toolkit/object";
  test("re-exports modules as namespaces with the identity of their entry", () => {
    expect(rootObject).toBe(object);
  });
  ```
  The root namespace object differs from the module entry's namespace in `dist/`. Same defect as the build output item of `toolkit.1`.
- To investigate: how tsdown (rolldown) emits `export * as` namespaces across entries, and whether a tsdown option restores the identity (for example shared chunks rather than a duplicated namespace object).
- Done when the test passes against `dist/` through a config option, or the limitation is documented with a reason.
