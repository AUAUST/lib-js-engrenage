import { readFileSync } from "node:fs";

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

describe("syncChangesetConfig", () => {
  test("writes the shared and derived options and keeps the project ones", async () => {
    const project = createTemporaryProject({
      ...installedPackages,
      "engrenage.config.ts": "export default {};\n",
      "package.json": JSON.stringify({
        type: "module",
        repository: {
          url: "git+https://github.com/owner/repo.git",
        },
        publishConfig: {
          access: "public",
        },
        devDependencies: {
          "@changesets/changelog-github": "*",
          "@changesets/cli": "*",
        },
      }),
      ".changeset/config.json": JSON.stringify({
        access: "restricted",
        ignore: ["@owner/private"],
      }),
    });

    const config = await loadConfig(project.root);

    expect(
      syncChangesetConfig({
        config,
      }),
    ).toEqual([
      {
        file: ".changeset/config.json",
        status: "synced",
      },
    ]);
    expect(
      JSON.parse(
        readFileSync(project.resolve(".changeset/config.json"), "utf8"),
      ),
    ).toEqual({
      $schema: "https://unpkg.com/@changesets/config@4.0.1/schema.json",
      access: "public",
      ignore: ["@owner/private"],
      baseBranch: "main",
      commit: false,
      format: "auto",
      updateInternalDependencies: "patch",
      changelog: [
        "@changesets/changelog-github",
        {
          repo: "owner/repo",
        },
      ],
    });
  });

  test("uses the default changelog without the GitHub generator and skips projects without changesets", async () => {
    const project = createTemporaryProject({
      ...installedPackages,
      "engrenage.config.ts": "export default {};\n",
      "package.json": JSON.stringify({
        type: "module",
        repository: "owner/repo",
        devDependencies: {
          "@changesets/cli": "*",
        },
      }),
    });

    const config = await loadConfig(project.root);

    syncChangesetConfig({
      config,
    });

    expect(
      JSON.parse(
        readFileSync(project.resolve(".changeset/config.json"), "utf8"),
      ),
    ).toMatchObject({
      access: "restricted",
      changelog: "@changesets/cli/changelog",
    });

    const unrelated = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
    });

    expect(
      syncChangesetConfig({
        config: await loadConfig(unrelated.root),
      }),
    ).toEqual([]);
  });
});
