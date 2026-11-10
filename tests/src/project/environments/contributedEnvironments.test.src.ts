import { describe, expect, test } from "vitest";

import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { findDirectories } from "#foundation/filesystem/index";
import {
  declareList,
  declareObject,
  declareSection,
  directorySchema,
} from "#foundation/options/index";
import {
  createProjectConfig,
  type ConfigResolver,
  type Extension,
} from "#project/config/index";
import {
  readEnvironment,
  readInputDirs,
  resolveEnvironmentDirs,
} from "#project/environments/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncAgents } from "#tools/agents/index";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { resolveScopeSources } from "#tools/eslint/operations/resolveScopeSources";

const liquidSchema = declareObject(
  {
    dirs: declareList(directorySchema, {
      optional: { value: ["liquid"] },
    }),
  },
  {
    optional: true,
  },
);

const liquidSection = declareSection({
  async resolve(_input, config: ConfigResolver) {
    const dirs = await resolveEnvironmentDirs(
      config,
      "liquid",
      readInputDirs(await config.input("liquid.options")) ?? ["liquid"],
    );

    return {
      active: isNotEmpty(
        await findDirectories(config.context.filesystem, dirs),
      ),
      dirs,
    };
  },
});

const liquidOptionsSection = declareSection({
  declaration: liquidSchema,
  resolve() {
    return {
      enabled: true,
      roles: [],
      structure: {
        layers: undefined,
        relation: "peers",
        purpose: undefined,
        roles: { enable: [] },
        namespaces: {},
        domains: {},
      },
      optOut: [],
      strictness: "loose",
    };
  },
});

function createLiquid(owns: readonly string[] = []): Extension {
  return {
    name: "fixture/liquid",
    owns: {
      keys: {
        "liquid": {
          load() {
            return Promise.resolve(liquidSection);
          },
        },
        "liquid.options": {
          input: "liquid",
          load() {
            return Promise.resolve(liquidOptionsSection);
          },
        },
      },
    },
    contributes: {
      environments: [
        {
          name: "liquid",
          title: "the Liquid templates",
          level: "described",
          structure: "roles",
          imports: [],
          owns,
        },
      ],
    },
  };
}

function createWorkers(
  level: "described" | "enforced",
  defaults: readonly string[] = ["workers"],
): Extension {
  const workersSection = declareSection({
    async resolve(_input, config: ConfigResolver) {
      const dirs = await resolveEnvironmentDirs(
        config,
        "workers",
        readInputDirs(await config.input("workers.options")) ?? defaults,
      );

      return {
        active: isNotEmpty(
          await findDirectories(config.context.filesystem, dirs),
        ),
        dirs,
        globs: dirs.map((dir) => `${dir}/**/*.ts`),
        generated: ["**/*.gen.ts"],
      };
    },
  });

  return {
    name: "fixture/workers",
    owns: {
      keys: {
        "workers": {
          load() {
            return Promise.resolve(workersSection);
          },
        },
        "workers.options": {
          input: "workers",
          load() {
            return Promise.resolve(liquidOptionsSection);
          },
        },
      },
    },
    contributes: {
      environments: [
        {
          name: "workers",
          title: "the workers",
          level,
          structure: "domains",
          code: "private",
        },
      ],
    },
  };
}

function createWorkersConfig(
  extension: Extension,
  input: Readonly<Record<string, unknown>> = {},
) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "src/index.ts": "",
    "workers/queue/index.ts": "",
    "workers/queue/client.gen.ts": "",
    "spec/a.ts": "",
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({ extensions: [extension], ...input }),
    configFile: undefined,
  });
}

function createConfig(
  input: Readonly<Record<string, unknown>>,
  files: Readonly<Record<string, string>>,
  owns?: readonly string[],
) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    ...files,
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({ extensions: [createLiquid(owns)], ...input }),
    configFile: undefined,
  });

  return { project, config };
}

describe("contributed environments", () => {
  test("get a matrix row, a column no other environment imports and their own project map", async () => {
    const { project, config } = createConfig(
      {
        agents: { preferred: ["claude"] },
      },
      {
        "src/feature/index.ts": "",
        "tests/feature.test.ts": "",
        "liquid/page.liquid": "",
      },
    );

    await syncAgents(config);

    await config.context.filesystem.flush();

    const lines = project.read(".claude/rules/project-map.md").split("\n");

    function cells(prefix: string): readonly string[] {
      return (
        lines
          .findLast((line) => line.startsWith(prefix))
          ?.split("|")
          .map((cell) => cell.trim()) ?? []
      );
    }

    const column = cells("| from / to |").indexOf("liquid");

    expect(column).toBeGreaterThan(0);

    expect(cells("| `liquid` |")).toContain(
      "`.claude/rules/project-map/liquid.md`",
    );

    for (const environment of ["src", "tests"]) {
      expect(cells(`| \`${environment}\` |`)[column]).toBe("never");
    }

    expect(project.read(".claude/rules/project-map/liquid.md")).toContain(
      "# Project map: liquid",
    );
  });

  test("keep the directories another environment owns out of their defaults", async () => {
    const { config } = createConfig({}, { "tests/a.test.ts": "" }, ["tests"]);

    expect(await readEnvironment(config, "tests")).toMatchObject({
      active: false,
      dirs: [],
    });
  });

  test.each([
    [
      {
        liquid: { dirs: ["tests"] },
      },
      false,
    ],
    [
      {
        liquid: { dirs: ["tests"] },
        tests: { dirs: ["tests"] },
      },
      true,
    ],
    [
      {
        tests: { dirs: ["tests"] },
      },
      true,
    ],
  ])(
    "leave explicit directories claimed by %j: tests active is %s",
    async (input, active) => {
      const { config } = createConfig(input, { "tests/a.test.ts": "" });

      expect((await readEnvironment(config, "tests")).active).toBe(active);
    },
  );

  test("get aliases, entities, files and lint scopes when enforced", async () => {
    const config = createWorkersConfig(createWorkers("enforced"));

    const [aliases, entities, files, scopes] = await Promise.all([
      config.resolve("aliases"),
      config.resolve("entities"),
      config.resolve("files"),
      resolveScopeSources(config),
    ]);

    expect(aliases.global.map(({ key }) => key)).toContain("#workers/*");

    expect(entities.entityOf("workers/queue/index.ts")?.environment).toBe(
      "workers",
    );

    expect(files.generated).toContain("workers/**/*.gen.ts");

    expect(resolveScope(scopes, ["files.workers"])).toEqual([
      "workers/**/*.ts",
    ]);

    expect(resolveScope(scopes, ["files.code.private"])).toContain(
      "workers/**/*.ts",
    );
  });

  test("get no alias when described", async () => {
    const config = createWorkersConfig(createWorkers("described"));

    const { global } = await config.resolve("aliases");

    expect(global.map(({ key }) => key)).not.toContain("#workers/*");
  });

  test("leave out the directories another environment appends", async () => {
    const config = createWorkersConfig(
      createWorkers("enforced", ["workers", "spec"]),
      {
        tests: {
          dirs: { append: ["spec"] },
        },
      },
    );

    expect((await readEnvironment(config, "workers")).dirs).toEqual([
      "workers",
    ]);
  });
});
