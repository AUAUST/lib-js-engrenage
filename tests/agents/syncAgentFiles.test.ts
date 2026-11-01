import { join } from "node:path";

import { describe, expect, test } from "vitest";

import {
  resolveAgentReference,
  syncAgentFiles,
} from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("agents");

const from = join(root, "INSTRUCTIONS.md");

describe("syncAgentFiles", () => {
  test("syncs only the configured instruction files", async () => {
    const config = await loadConfig(root);

    syncAgentFiles(config);

    expect(config.filesystem.discard()).toEqual([
      {
        file: "INSTRUCTIONS.md",
        status: "synced",
      },
    ]);
  });

  test("resolves snippets, references relative to the file and package specifiers", async () => {
    const config = await loadConfig(root);

    expect(resolveAgentReference(config, "shared.md", from)).toBe(
      join(root, ".agents/snippets/shared.md"),
    );

    expect(resolveAgentReference(config, "./AGENTS.md", from)).toBe(
      join(root, "AGENTS.md"),
    );

    expect(
      resolveAgentReference(
        config,
        "@auaust/engrenage/agents/sections/precedence.md",
        import.meta.filename,
      ),
    ).toMatch(/\/data\/agents\/sections\/precedence\.md$/);
  });

  test("resolves package fragments exported only under the import condition", async () => {
    const config = await loadConfig(root);

    const project = createTemporaryProject({
      "AGENTS.md": "",
      "node_modules/fragments/package.json": JSON.stringify({
        name: "fragments",
        type: "module",
        exports: {
 "./*.md": { import: "./*.md" } 
},
      }),
      "node_modules/fragments/shared.md": "",
    });

    expect(
      resolveAgentReference(
        config,
        "fragments/shared.md",
        project.resolve("AGENTS.md"),
      ),
    ).toBe(project.resolve("node_modules/fragments/shared.md"));
  });

  test("names the reference and the file when nothing matches", async () => {
    const config = await loadConfig(root);

    expect(() => {
      return resolveAgentReference(config, "missing.md", from);
    }).toThrow(`Cannot resolve reference "missing.md" in ${from}`);
  });
});
