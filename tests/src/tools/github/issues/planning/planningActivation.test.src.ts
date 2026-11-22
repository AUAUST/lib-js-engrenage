import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { syncGeneratedRules } from "#tools/metalbrain/index";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";

function createConfig({
  repository,
  planning,
  extensions = [],
}: {
  repository?: string;
  planning?: boolean;
  extensions?: readonly unknown[];
}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "app",
      type: "module",
      ...(repository === undefined ? {} : { repository }),
    }),
  });

  return createProjectConfig({
    root: project.root,
    raw: {
      extensions,
      agents: { preferred: ["claude"] },
      ...(planning === undefined
        ? {}
        : {
            github: { planning },
          }),
    },
    configFile: undefined,
    reporter: createTestReporter(),
  });
}

async function describePlanning(config: ReturnType<typeof createConfig>) {
  const resources = await config.resolve("resources");

  await syncGeneratedRules(config);

  const skills = await getSkillDefinitions({
    extensions: await listActiveExtensions(config),
  });

  return {
    snapshot: resources.get("state.github") !== undefined,
    sheet: await config.context.filesystem.exists(
      ".claude/rules/planning-sheet.md",
    ),
    skills: skills
      .map(({ name }) => name)
      .filter((name) => {
        return ["planning", "walking", "merging"].includes(name);
      })
      .toSorted(),
  };
}

const off = {
  snapshot: false,
  sheet: false,
  skills: [],
};

const on = {
  snapshot: true,
  sheet: true,
  skills: ["merging", "planning", "walking"],
};

describe("GitHub planning activation", () => {
  test("stays off without a github.com repository", async () => {
    expect(
      await describePlanning(
        createConfig({ repository: "https://gitlab.com/o/app.git" }),
      ),
    ).toEqual(off);
  });

  test("follows github.planning over the repository", async () => {
    expect(await describePlanning(createConfig({ planning: true }))).toEqual(
      on,
    );

    expect(
      await describePlanning(
        createConfig({ repository: "github:o/app", planning: false }),
      ),
    ).toEqual(off);
  });

  test("names github.planning when an extension requires inactive planning", async () => {
    const config = createConfig({
      extensions: [
        {
          name: "needs-planning",
          requires: ["tools/github/issues/planning"],
          owns: {
            keys: {
              needsPlanning: {
                load() {
                  return Promise.resolve({
                    resolve() {
                      return true;
                    },
                  });
                },
              },
            },
          },
        },
      ],
    });

    const resolver: Resolver<ConfigContext> = config;

    await expect(resolver.resolve("needsPlanning")).rejects.toThrow(
      "set github.planning to true",
    );
  });
});
