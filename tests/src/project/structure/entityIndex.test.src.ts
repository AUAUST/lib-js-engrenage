import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import {
  constants,
  createRolePreset,
  entrypoint,
  errors,
  index,
  utils,
} from "#project/roles/index";
import { createEntityIndex } from "#project/structure/utils/createEntityIndex";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const config = createRolePreset({
  name: "config",
  effects: "confined",
  roles: [
    {
      name: "schemas",
      file: "*Schema.ts",
      effects: "confined",
    },
    {
      name: "definers",
      file: "define*Config.ts",
      effects: "effectful",
    },
  ],
});

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const staticDefiners = JSON.stringify("define*Config.ts");

const conventions = createRolePreset({
  name: "conventions",
  exports: "default",
  index: true,
});

function renderRoles(indexFile: string, definers: string) {
  const roles = JSON.stringify([
    index({ file: [indexFile] }),
    entrypoint(),
    constants(),
    errors(),
    utils(),
    config(),
    conventions(),
  ]);

  return roles.replace(staticDefiners, () => definers);
}

async function createIndex(indexFile = "index.ts", definers = staticDefiners) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "library", "type": "module" }',
    "tsconfig.json": "{}",
    "engrenage.config.ts": `export default { preset: "library", src: { node: 24, roles: ${renderRoles(indexFile, definers)}, structure: { layers: ["foundation", "project"] } } };\n`,
    "src/entry.ts": "",
    "src/foundation/base/index.ts": "",
    "src/project/feature/index.ts": "",
    "src/project/feature/entry.ts": "",
    "src/project/feature/constants.ts": "",
    "src/project/feature/utils/own.ts": "",
    "src/project/feature/errors/Failure.ts": "",
    "src/project/feature/config/featureSchema.ts": "",
    "src/project/feature/config/defineFeatureConfig.ts": "",
    "src/project/feature/config/helper.ts": "",
    "src/project/feature/config/setupFeature.ts": "",
    "src/project/feature/conventions/index.ts": "",
    "src/project/feature/conventions/main.ts": "",
    "src/project/feature/utils/main.ts": "",
    "tests/x.test.src.ts": "",
  });

  return indexProject(project.root);
}

async function indexProject(root: string) {
  const config = await loadConfig(root);

  const [
    structure,
    source,
    tests,
    bin,
    scripts,
    tooling,
    data,
    aliases,
    roles,
  ] = await Promise.all([
    config.resolve("structure"),
    config.resolve("src"),
    config.resolve("tests"),
    config.resolve("bin"),
    config.resolve("scripts"),
    config.resolve("tooling"),
    config.resolve("data"),
    config.resolve("aliases"),
    config.resolve("environmentRoles"),
  ]);

  return createEntityIndex({
    root,
    structure,
    environments: {
      src: source,
      tests,
      bin,
      scripts,
      tooling,
      data,
    },
    roles,
    testPatterns: tests.patterns,
    workspaces: [],
    outDir: "dist",
    aliases,
    packageName: "library",
  });
}

describe("createEntityIndex", () => {
  test("places a role module in its domain, role and layer, with the domain's surface", async () => {
    const index = await createIndex();

    expect(index.entityOf("src/project/feature/utils/own.ts")).toMatchObject({
      environment: "src",
      domain: "project/feature",
      role: "utils",
      lineage: [
        {
          path: "src",
          layers: ["foundation", "project"],
        },
        {
          path: "src/project",
          kind: "namespace",
          layer: 1,
        },
        {
          path: "src/project/feature",
          kind: "domain",
        },
      ],
      surface: [
        "#project/feature/index",
        "#project/feature/errors/*",
        "library/feature",
      ],
    });
  });

  test("gives a file directly in a domain its file role, and a test its variant", async () => {
    const index = await createIndex();

    expect(index.entityOf("src/project/feature/constants.ts")).toMatchObject({
      role: "constants",
      fileRole: "constants",
    });

    expect(index.entityOf("tests/x.test.src.ts")).toMatchObject({
      environment: "tests",
      variant: "src",
    });
  });

  test("gives a file at a role's root the nested role its name matches, else the role", async () => {
    const index = await createIndex();

    expect(
      index.entityOf("src/project/feature/config/featureSchema.ts"),
    ).toMatchObject({ role: "config/schemas", effects: "confined" });

    expect(
      index.entityOf("src/project/feature/config/defineFeatureConfig.ts"),
    ).toMatchObject({ role: "config/definers", effects: "effectful" });

    expect(
      index.entityOf("src/project/feature/config/helper.ts"),
    ).toMatchObject({ role: "config", effects: "confined" });
  });

  test("matches a nested role's root files against the names its callback returns for the location", async () => {
    const index = await createIndex(
      "index.ts",
      '({ lineage }) => [`define${lineage.at(-1).name}Config.ts`, "setupFeature.ts"]',
    );

    expect(
      index.entityOf("src/project/feature/config/definefeatureConfig.ts"),
    ).toMatchObject({ role: "config/definers" });

    expect(
      index.entityOf("src/project/feature/config/setupFeature.ts"),
    ).toMatchObject({ role: "config/definers" });

    expect(
      index.entityOf("src/project/feature/config/defineFeatureConfig.ts"),
    ).toMatchObject({ role: "config" });
  });

  test("names each definer of engrenage after its domain", async () => {
    const index = await indexProject(repositoryRoot);

    expect(
      index.entityOf("src/tools/vite/config/defineViteConfig.ts"),
    ).toMatchObject({ role: "config/definers" });

    expect(
      index.entityOf("src/workflows/config/config/defineConfig.ts"),
    ).toMatchObject({ role: "config/definers" });

    expect(
      index.entityOf("src/tools/vite/config/defineViteConfiguration.ts"),
    ).toMatchObject({ role: "config" });
  });

  test("has no entity for a file in a directory the walk never saw, outside a role", async () => {
    const index = await createIndex();

    expect(index.entityOf("src/project/feature/unseen/x.ts")).toBeUndefined();
  });

  test("gives a role's barrel only to the index file of a role with index", async () => {
    const renamed = await createIndex("main.ts");

    expect(
      renamed.entityOf("src/project/feature/conventions/main.ts"),
    ).toMatchObject({ role: "conventions", fileRole: "index" });

    expect(
      renamed.entityOf("src/project/feature/conventions/index.ts"),
    ).toMatchObject({ role: "conventions", fileRole: undefined });

    expect(renamed.entityOf("src/project/feature/utils/main.ts")).toMatchObject(
      { role: "utils", fileRole: undefined },
    );
  });

  test("keeps the file roles of a domain's index and entry", async () => {
    const index = await createIndex();

    expect(index.entityOf("src/project/feature/index.ts")).toMatchObject({
      role: "index",
      fileRole: "index",
    });

    expect(index.entityOf("src/project/feature/entry.ts")).toMatchObject({
      role: "entrypoint",
      fileRole: "entrypoint",
    });
  });
});
