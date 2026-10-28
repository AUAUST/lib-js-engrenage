import { expect, test } from "vitest";

import { getPatchedFiles } from "#agents/codex/utils/getPatchedFiles";

test("extracts additions, updates and rename destinations while excluding deletions", () => {
  expect(
    getPatchedFiles(`*** Begin Patch
*** Add File: new.ts
+new
*** Update File: existing.ts
@@
-old
+new
*** Update File: old.ts
*** Move to: renamed.ts
@@
-old
+new
*** Delete File: removed.ts
*** End Patch`),
  ).toEqual(["new.ts", "existing.ts", "renamed.ts"]);
});

test("rejects an unexpected patch envelope", () => {
  expect(() => getPatchedFiles("not a patch")).toThrow(
    "Invalid Codex patch envelope",
  );
});
