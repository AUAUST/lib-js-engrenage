import { describe, expect, test } from "vitest";

import { findNamespaceViolations } from "#metalbrain/records/index";

describe("findNamespaceViolations", () => {
  test("rejects a namespace two kinds declare", () => {
    expect(
      findNamespaceViolations([
        { name: "backlog", namespace: "BL" },
        { name: "notes", namespace: "BL" },
      ]),
    ).toEqual(["The notes kind's namespace BL is already the backlog kind's"]);
  });
});
