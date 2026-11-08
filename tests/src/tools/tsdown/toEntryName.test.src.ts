import { expect, test } from "vitest";

import { toEntryName } from "#tools/tsdown/utils/toEntryName";

test("names a directory entry after the executable file it is given", () => {
  expect(toEntryName("bin/cli/main.ts", "main.ts")).toBe("bin/cli");
  expect(toEntryName("bin/cli/index.ts", "main.ts")).toBe("bin/cli/index");
  expect(toEntryName("bin/cli.ts", "main.ts")).toBe("bin/cli");
  expect(toEntryName("bin/cli/main.ts", undefined)).toBe("bin/cli/main");
});
