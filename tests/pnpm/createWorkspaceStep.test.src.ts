import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createWorkspaceStep } from "#pnpm/setup/createWorkspaceStep";
import { createPrompter } from "#support/scaffold/utils/createPrompter";
import { createStepContext } from "#support/scaffold/utils/createStepContext";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

function createContext(content: string) {
  const project = createTemporaryProject({
    "pnpm-workspace.yaml": content,
  });

  return createStepContext({
    config: createResolvedConfig({
      root: project.root,
      raw: {},
      configFile: undefined,
    }),
    prompter: createPrompter({ yes: true }),
  });
}

describe("createWorkspaceStep", () => {
  test("adds approvals to an empty workspace file", async () => {
    const context = createContext("# Workspace\n");
    const step = createWorkspaceStep();

    expect(step.isMissing(context)).toBe(true);

    await step.plan(context);

    expect(context.filesystem.read("pnpm-workspace.yaml")).toContain(
      "# Workspace",
    );

    expect(step.isMissing(context)).toBe(false);
  });

  test.each(["", "allowBuilds:\n  esbuild: false # Explicit denial\n"])(
    "adds missing approvals and preserves existing choices and comments: %s",
    async (builds) => {
      const content = `# Workspace\npackages:\n  - packages/*\n${builds}minimumReleaseAgeExclude:\n  - internal-package\n`;

      const context = createContext(content);
      const step = createWorkspaceStep();

      expect(step.isMissing(context)).toBe(true);

      await step.plan(context);

      const updated = context.filesystem.read("pnpm-workspace.yaml");

      expect(updated).toContain("# Workspace");

      expect(parse(updated ?? "")).toEqual({
        packages: ["packages/*"],
        allowBuilds: {
          "esbuild": builds === "",
          "unrs-resolver": true,
        },
        minimumReleaseAgeExclude: ["internal-package"],
      });

      if (builds !== "") {
        expect(updated).toContain("esbuild: false # Explicit denial");
      }

      expect(step.isMissing(context)).toBe(false);
    },
  );

  test("leaves explicit approvals and denials byte-for-byte unchanged", () => {
    const content =
      "allowBuilds: {esbuild: false, unrs-resolver: true, custom: true}\n";

    const context = createContext(content);

    expect(createWorkspaceStep().isMissing(context)).toBe(false);
    expect(context.filesystem.read("pnpm-workspace.yaml")).toBe(content);
    expect(context.filesystem.changes()).toEqual([]);
  });

  test.each(["packages: [\n", "- package\n", "allowBuilds: false\n"])(
    "rejects invalid workspace settings without changing them: %s",
    (content) => {
      const context = createContext(content);

      expect(() => createWorkspaceStep().isMissing(context)).toThrow(
        "pnpm-workspace.yaml",
      );

      expect(context.filesystem.changes()).toEqual([]);
    },
  );
});
