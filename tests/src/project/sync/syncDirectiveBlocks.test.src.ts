import { describe, expect, test } from "vitest";

import { utils } from "#project/roles/index";
import { createBarrelProject } from "#tests/utils/createBarrelProject";

const extension = {
  name: "test/directives",
  owns: {
    directives: {
      greet: {
        files() {
          return Promise.resolve(["src/a.ts"]);
        },
        load() {
          return Promise.resolve(({ args }: { args: readonly string[] }) => {
            return Promise.resolve(`hello ${args[0]}`);
          });
        },
      },
      other: {
        files() {
          return Promise.resolve(["src/b.ts"]);
        },
        load() {
          return Promise.resolve(() => Promise.resolve(undefined));
        },
      },
    },
  },
};

function createKit(files: Record<string, string>) {
  return createBarrelProject({
    files,
    roles: [utils()],
    domains: {},
    extensions: [extension],
  });
}

describe("blocks sync target", () => {
  test("fills a directive's block in the files it declares, skipping line markers", async () => {
    const { project, sync } = createKit({
      "src/a.ts": "// @debt note\n// @greet x\n// @end\n",
      "src/b.ts": "",
    });

    await sync();

    expect(project.read("src/a.ts")).toBe(
      "// @debt note\n// @greet x\nhello x\n// @end\n",
    );
  });

  test("rejects a directive outside its files, naming the file and line", async () => {
    const { sync } = createKit({
      "src/a.ts": "",
      "src/b.ts": "const b = 1;\n// @greet x\n// @end\n",
    });

    await expect(sync()).rejects.toThrow(
      "src/b.ts: line 2: @greet fills only the files test/directives declares for it",
    );
  });

  test("rejects an unknown marker, naming the file", async () => {
    const { sync } = createKit({
      "src/a.ts": "// @unknown\n",
      "src/b.ts": "",
    });

    await expect(sync()).rejects.toThrow(
      /^src\/a\.ts: line 1: Unknown directive/,
    );
  });
});
