import { existsSync } from "node:fs";

import { multiselect } from "@clack/prompts";
import { afterEach, describe, expect, onTestFinished, test, vi } from "vitest";

import { defineProperty, ownDescriptor } from "@auaust/toolkit/object";

import { rules } from "#bin/engrenage/agents/rules";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

vi.mock(import("@clack/prompts"), async (original) => {
  return {
    ...(await original()),
    multiselect: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

function createProject(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts":
      'export default { agents: { preferred: ["codex"] } };',
    "AGENTS.md": "# Project instructions\n",
    "AGENTS.override.md": "<!-- @rules -->\n<!-- @end -->\n",
    ...files,
  });

  mockCwd(project.root);
  vi.spyOn(console, "info").mockImplementation(() => {});

  return project;
}

describe("agents rules", () => {
  test("installs by name, refreshes the Codex mapping and preserves existing files", async () => {
    const project = createProject();

    await runCommand(rules, "add", "code-style");

    const installed = project.read(".claude/rules/code-style.md");

    expect(installed).toContain(
      "@reference @auaust/engrenage/agents/rules/code-style.md",
    );

    expect(installed).toContain('"**/*.ts"');
    expect(installed).not.toContain("category:");

    expect(project.read("AGENTS.override.md")).toContain(
      ".claude/rules/code-style.md",
    );

    expect(project.read("AGENTS.md")).toBe("# Project instructions\n");

    project.write(
      ".claude/rules/code-style.md",
      `${installed}\nProject note.\n`,
    );

    await runCommand(rules, "add", "code-style");

    expect(project.read(".claude/rules/code-style.md")).toBe(
      `${installed}\nProject note.\n`,
    );

    await expect(runCommand(rules, "add", "unknown")).rejects.toThrow(
      "Unknown agent rule",
    );

    expect(existsSync(project.resolve(".claude/rules/unknown.md"))).toBe(false);
  });

  test("offers only missing rules, including non-default choices, and detects renamed references", async () => {
    const project = createProject({
      ".claude/rules/renamed.md":
        "<!-- @reference @auaust/engrenage/agents/rules/code-style.md -->\n<!-- @end -->\n",
      ".claude/rules/changesets.md": "Project-owned rule\n",
    });

    const descriptor = ownDescriptor(process.stdin, "isTTY");

    defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });

    onTestFinished(() => {
      if (descriptor === undefined) {
        Reflect.deleteProperty(process.stdin, "isTTY");
      } else {
        defineProperty(process.stdin, "isTTY", descriptor);
      }
    });

    vi.mocked(multiselect).mockResolvedValue(["prefer-toolkit"]);

    await runCommand(rules);

    expect(multiselect).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: [],
        options: [
          expect.objectContaining({
            value: "backlog",
          }),
          expect.objectContaining({
            value: "scratchpad",
          }),
          expect.objectContaining({
            value: "prefer-primitive-kit",
          }),
          expect.objectContaining({
            value: "prefer-toolkit",
          }),
        ],
      }),
    );

    expect(project.read(".claude/rules/prefer-toolkit.md")).toContain(
      "# Toolkit",
    );

    expect(existsSync(project.resolve(".claude/rules/code-style.md"))).toBe(
      false,
    );

    expect(project.read(".claude/rules/changesets.md")).toBe(
      "Project-owned rule\n",
    );
  });
});
