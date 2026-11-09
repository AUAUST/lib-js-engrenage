import { describe, expect, test } from "vitest";

import {
  createResourceIgnores,
  type FileLocation,
  type LocatedResource,
} from "#project/config/index";

function resource(
  name: string,
  title: string,
  location: FileLocation,
): LocatedResource {
  return {
    name,
    owner: name,
    title,
    location,
    committed: false,
    generated: false,
    formatted: false,
    parts: false,
  };
}

describe("createResourceIgnores", () => {
  test("groups the resources of two owners sharing a title at its first appearance", () => {
    expect(
      createResourceIgnores(
        [
          resource("first", "Cache", { directory: ".first" }),
          resource("output", "Output", { directory: "dist" }),
          resource("second", "Cache", { file: ".second.json" }),
          resource("logs", "Logs", { globs: ["**/*.log", "!keep.log"] }),
        ],
        { covered: [] },
      ),
    ).toEqual([
      { title: "Cache", globs: ["/.first", "/.second.json"] },
      { title: "Output", globs: ["/dist"] },
      { title: "Logs", globs: ["/**/*.log", "!/keep.log"] },
    ]);
  });

  test("skips a directory inside another and a path under a covered directory", () => {
    expect(
      createResourceIgnores(
        [
          resource("cache", "Cache", { directory: ".cache" }),
          resource("tool", "Cache", { directory: ".cache/tool" }),
          resource("modules", "Modules", {
            directory: "node_modules/.cache/tool",
          }),
        ],
        { covered: ["node_modules", "*.log", "/logs"] },
      ),
    ).toEqual([{ title: "Cache", globs: ["/.cache"] }]);
  });
});
