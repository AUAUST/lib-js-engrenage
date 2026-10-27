import { describe, expect, test } from "vitest";

import { syncChangesetConfig } from "@auaust/engrenage/changesets";
import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

const installedPackages = {
  "node_modules/@changesets/cli/package.json":
    '{ "name": "@changesets/cli", "version": "3.0.0" }',
  "node_modules/@changesets/config/package.json":
    '{ "name": "@changesets/config", "version": "4.0.1" }',
};

const changesetsProject = {
  ...installedPackages,
  "engrenage.config.ts": "export default {};\n",
  "package.json": JSON.stringify({
    type: "module",
    devDependencies: {
      "@changesets/cli": "*",
    },
  }),
};

describe("syncChangesetConfig", () => {
  test("writes the schema of the installed config package and keeps every other option", async () => {
    const project = createTemporaryProject({
      ...changesetsProject,
      ".changeset/config.json": JSON.stringify({
        access: "restricted",
        ignore: ["@owner/private"],
      }),
    });

    const config = await loadConfig(project.root);

    syncChangesetConfig(config);

    expect(config.filesystem.flush()).toEqual([
      {
        file: ".changeset/config.json",
        status: "synced",
      },
    ]);
    expect(JSON.parse(project.read(".changeset/config.json"))).toEqual({
      access: "restricted",
      ignore: ["@owner/private"],
      $schema: "https://unpkg.com/@changesets/config@4.0.1/schema.json",
    });
  });

  test("skips projects without changesets or without a config", async () => {
    const unconfigured = await loadConfig(
      createTemporaryProject(changesetsProject).root,
    );

    syncChangesetConfig(unconfigured);

    expect(unconfigured.filesystem.changes()).toEqual([]);

    const unrelated = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": "export default {};\n",
        "package.json": '{ "type": "module" }',
      }).root,
    );

    syncChangesetConfig(unrelated);

    expect(unrelated.filesystem.changes()).toEqual([]);
  });
});
