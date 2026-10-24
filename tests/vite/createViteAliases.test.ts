import { createViteAliases } from "@auaust/engrenage/vite";
import { describe, expect, test } from "vitest";

describe("createViteAliases", () => {
  test("maps each alias exactly to its resolved path", () => {
    const [alias] = createViteAliases(
      [
        {
          alias: "@scope/package/group",
          name: "group/index",
          path: "src/group/index.ts",
        },
      ],
      "/project",
    );

    expect(alias?.replacement).toBe("/project/src/group/index.ts");
    expect(alias?.find).toBeInstanceOf(RegExp);
    expect("@scope/package/group").toMatch(alias?.find ?? "");
    expect("@scope/package/group/nested").not.toMatch(alias?.find ?? "");
  });

  test("escapes regular expression characters in aliases", () => {
    const [alias] = createViteAliases(
      [
        {
          alias: "$utils.v2",
          name: "utils",
          path: "src/utils.ts",
        },
      ],
      "/project",
    );

    expect("$utils.v2").toMatch(alias?.find ?? "");
    expect("$utilsXv2").not.toMatch(alias?.find ?? "");
  });
});
