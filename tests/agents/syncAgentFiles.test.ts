import {
  resolveAgentReference,
  syncAgentFiles,
} from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const root = fileURLToPath(new URL("../fixtures/agents", import.meta.url));

const from = join(root, "INSTRUCTIONS.md");

describe("syncAgentFiles", () => {
  test("syncs only the configured instruction files", async () => {
    const config = await loadConfig(root);

    expect(
      syncAgentFiles({
        config,
        check: true,
      }),
    ).toEqual(["INSTRUCTIONS.md"]);
  });

  test("resolves snippets and references relative to the file", async () => {
    const config = await loadConfig(root);

    expect(resolveAgentReference(config, "shared.md", from)).toBe(
      join(root, ".agents/snippets/shared.md"),
    );
    expect(resolveAgentReference(config, "./AGENTS.md", from)).toBe(
      join(root, "AGENTS.md"),
    );
  });

  test("names the reference and the file when nothing matches", async () => {
    const config = await loadConfig(root);

    expect(() => {
      return resolveAgentReference(config, "missing.md", from);
    }).toThrow(`Cannot resolve reference "missing.md" in ${from}`);
  });
});
