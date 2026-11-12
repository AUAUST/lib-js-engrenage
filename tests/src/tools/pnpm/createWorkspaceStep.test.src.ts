import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createWorkspaceStep } from "#tools/pnpm/setup/createWorkspaceStep";
import { createPrompter } from "#workflows/init/operations/createPrompter";
import { createStepContext } from "#workflows/init/operations/createStepContext";

async function createContext(content: string) {
  const project = createTemporaryProject({
    "pnpm-workspace.yaml": content,
  });

  return await createStepContext({
    config: createProjectConfig({
      root: project.root,
      raw: {},
      configFile: undefined,
    }),
    prompter: createPrompter({ yes: true }),
  });
}

describe("createWorkspaceStep", () => {
  test("adds approvals to an empty workspace file", async () => {
    const context = await createContext("# Workspace\n");

    const step = createWorkspaceStep();

    expect(await step.isMissing(context)).toBe(true);

    await step.plan(context);

    expect(await context.filesystem.read("pnpm-workspace.yaml")).toContain(
      "# Workspace",
    );

    expect(await step.isMissing(context)).toBe(false);
  });

  test.each(["", "allowBuilds:\n  esbuild: false # Explicit denial\n"])(
    "adds missing approvals and preserves existing choices and comments: %s",
    async (builds) => {
      const content = `# Workspace\npackages:\n  - packages/*\n${builds}minimumReleaseAgeExclude:\n  - internal-package\n`;

      const context = await createContext(content);

      const step = createWorkspaceStep();

      expect(await step.isMissing(context)).toBe(true);

      await step.plan(context);

      const updated = await context.filesystem.read("pnpm-workspace.yaml");

      expect(updated).toContain("# Workspace");

      expect(parse(updated ?? "")).toEqual({
        packages: ["packages/*"],
        allowBuilds: {
          "esbuild": builds === "",
          "lefthook": false,
          "unrs-resolver": true,
        },
        minimumReleaseAgeExclude: ["internal-package", "@auaust/*"],
      });

      if (builds !== "") {
        expect(updated).toContain("esbuild: false # Explicit denial");
      }

      expect(await step.isMissing(context)).toBe(false);
    },
  );

  test("leaves explicit approvals and denials byte-for-byte unchanged", async () => {
    const content = 'allowBuilds: {esbuild: false, lefthook: true, unrs-resolver: true, custom: true}\nminimumReleaseAgeExclude: ["@auaust/*"]\n';

    const context = await createContext(content);

    expect(await createWorkspaceStep().isMissing(context)).toBe(false);

    expect(await context.filesystem.read("pnpm-workspace.yaml")).toBe(content);

    expect(context.filesystem.changes()).toEqual([]);
  });

  test.each(["packages: [\n", "- package\n", "allowBuilds: false\n"])(
    "rejects invalid workspace settings without changing them: %s",
    async (content) => {
      const context = await createContext(content);

      await expect(createWorkspaceStep().isMissing(context)).rejects.toThrow(
        "pnpm-workspace.yaml",
      );

      expect(context.filesystem.changes()).toEqual([]);
    },
  );
});
