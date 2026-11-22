import { describe, expect, test } from "vitest";

import * as agents from "@auaust/engrenage/metalbrain";

describe("package entry", () => {
  test("exposes what entry.ts re-exports and not what only index.ts exports", () => {
    expect(agents).toHaveProperty("syncAgents");
    expect(agents).not.toHaveProperty("createAgentsStep");
  });
});
