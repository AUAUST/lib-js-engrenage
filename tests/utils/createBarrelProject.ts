import { vi } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { entrypoint, index, type Role } from "#project/roles/index";
import { runSync, settleChanges } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";

export function createBarrelProject({
  files,
  roles,
  domains,
  namespaces = {},
  extensions = [],
}: {
  files: Record<string, string>;
  roles: readonly Role[];
  domains: Record<string, Record<string, unknown>>;
  namespaces?: Record<string, Record<string, unknown>>;
  extensions?: readonly unknown[];
}) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "@fixture/kit", "type": "module" }',
    "tsconfig.json": "{}",
    ...files,
  });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  const config = createProjectConfig({
    root: project.root,
    raw: {
      preset: "library",
      agents: {
        preferred: ["claude"],
      },
      src: {
        node: 24,
        roles: [index(), entrypoint(), ...roles],
        structure: {
          namespaces: {
            modules: {
              children: "domains",
              domains,
            },
            ...namespaces,
          },
        },
      },
      extensions,
    },
    configFile: undefined,
  });

  async function sync() {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    try {
      await settleChanges(config, {
        check: false,
        failures: await runSync(config),
      });
    } finally {
      info.mockRestore();
    }
  }

  return {
    project,
    config,
    sync,
  };
}
