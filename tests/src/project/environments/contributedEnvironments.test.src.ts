import { describe, expect, test } from "vitest";

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
  discoverDeclaredEnvironment,
  getOptionsKey,
  listEnvironmentEntries,
  listLanguageFiles,
  readEnvironment,
  readEnvironmentLanguages,
  readInputDirs,
} from "#project/environments/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { resolveScopeSources } from "#tools/eslint/operations/resolveScopeSources";
import { syncAgents } from "#tools/metalbrain/index";

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
    const {
      dirs,
      active,
    } = await discoverDeclaredEnvironment(config, "liquid");

    return { active, dirs };
  },
});

function createOptionsSection(defaults: readonly string[]) {
  return declareSection({
    declaration: liquidSchema,
    resolve(input) {
      return {
        dirs: readInputDirs(input) ?? defaults,
        enabled: true,
        roles: [],
        structure: {
          layers: undefined,
          relation: "peers",
          children: undefined,
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
}

const liquidOptionsSection = createOptionsSection(["liquid"]);

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
      namespaceKinds: [
        {
          name: "liquid",
          level: "described",
          structure: "roles",
          imports: {},
        },
      ],
      environmentKinds: [
        {
          name: "liquid",
        },
      ],
      environments: [
        {
          name: "liquid",
          kind: "liquid",
          title: "the Liquid templates",
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
      const {
        dirs,
        active,
      } = await discoverDeclaredEnvironment(config, "workers");

      return {
        active,
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
            return Promise.resolve(createOptionsSection(defaults));
          },
        },
      },
    },
    contributes: {
      namespaceKinds: [
        {
          name: "workers",
          level,
          structure: "domains",
          code: "private",
        },
      ],
      environmentKinds: [
        {
          name: "workers",
        },
      ],
      environments: [
        {
          name: "workers",
          kind: "workers",
          title: "the workers",
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
    "package.json": '{ "name": "project", "type": "module", "repository": "github:o/project" }',
    ...files,
  });

  const reporter = createTestReporter();

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      extensions: [createLiquid(owns)],
      ...input,
    }),
    configFile: undefined,
    reporter,
  });

  return {
    project,
    config,
    reporter,
  };
}

describe("environment languages", () => {
  test("follow an environment metafile over the kind's defaults, in globs and lint scopes", async () => {
    const { config } = createConfig(
      {},
      {
        "src/.environment.json": '{ "languages": ["typescript"] }',
        "src/index.ts": "",
      },
    );

    const [
      source,
      scopes,
    ] = await Promise.all([config.resolve("src"), resolveScopeSources(config)]);

    expect(source.globs).toEqual(["src/**/*{.ts,.mts,.cts}"]);

    expect(resolveScope(scopes, ["files.code"])).not.toContain("src/**/*.tsx");
  });

  test("fail on an option naming a language no extension contributes", async () => {
    const { config } = createConfig(
      {
        src: { languages: ["vue"] },
      },
      {
        "src/index.ts": "",
      },
    );

    await expect(config.resolve("src")).rejects.toThrow(
      "The src environment selects the language vue, which no active extension contributes",
    );
  });
});

describe("contributed environments", () => {
  test("get a matrix row, a column no other environment imports and their own project map", async () => {
    const { project, config, reporter } = createConfig(
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

    expect(reporter.warnings).toContainEqual(
      expect.stringContaining("No GitHub snapshot"),
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

    expect(entities.entityOf("workers/queue/index.ts")?.namespace).toBe(
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

  test("select no language when their kind and options name none", async () => {
    const config = createWorkersConfig(createWorkers("enforced"));

    expect(
      listLanguageFiles(await readEnvironmentLanguages(config, "workers")),
    ).toEqual([]);
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

  test("list an environment of a contributed kind under its own config key", async () => {
    const site: Extension = {
      name: "fixture/site",
      owns: {
        keys: {
          "site": {
            load() {
              return Promise.resolve(liquidSection);
            },
          },
          "site.options": {
            input: "site",
            load() {
              return Promise.resolve(liquidOptionsSection);
            },
          },
        },
      },
      contributes: {
        namespaceKinds: [
          {
            name: "site",
            level: "enforced",
            structure: "domains",
          },
        ],
        environments: [
          {
            name: "site",
            kind: "src",
            title: "the site",
          },
        ],
      },
    };

    const config = createWorkersConfig(site, {
      site: { dirs: ["web"] },
    });

    const environments = await listEnvironmentEntries(config);

    const listed = environments.find(({ entry }) => entry.name === "site");

    expect(listed?.kind).toMatchObject({
      name: "src",
      languages: ["typescript", "tsx"],
    });

    const { kind } = await discoverDeclaredEnvironment(config, "site");

    expect(kind).toMatchObject({
      name: "site",
      level: "enforced",
      structure: "domains",
    });

    const key = listed === undefined ? undefined : getOptionsKey(listed);

    expect(key).toBe("site.options");

    const claims = await config.resolve("environments.claims");

    expect(claims.site?.dirs).toEqual(["web"]);
  });

  test("fail on a kind two extensions contribute", () => {
    expect(() => {
      return createWorkersConfig({
        name: "fixture/twin",
        contributes: {
          environmentKinds: [{ name: "src" }],
        },
      });
    }).toThrow(
      'Slot "environmentKinds" has two entries named "src", from project/environments and fixture/twin',
    );
  });

  test("fail on an environment naming a kind no extension contributes", async () => {
    const config = createWorkersConfig({
      name: "fixture/nope",
      contributes: {
        environments: [
          {
            name: "nope",
            kind: "nope",
            title: "nothing",
          },
        ],
      },
    });

    await expect(listEnvironmentEntries(config)).rejects.toThrow(
      'Environment "nope" names the kind "nope", which no active extension contributes',
    );
  });
});
