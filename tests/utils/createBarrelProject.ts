import { createProjectConfig } from "#project/config/index";
import { entrypoint, index } from "#project/roles/index";
import { runSync, settleChanges } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import type { Role } from "#batiment/roles/index";

export function createBarrelProject({
  files,
  roles,
  domains,
  namespaces = {},
  extensions = [],
  published = true,
}: {
  files: Record<string, string>;
  roles: readonly Role[];
  domains: Record<string, Record<string, unknown>>;
  namespaces?: Record<string, Record<string, unknown>>;
  extensions?: readonly unknown[];
  published?: boolean;
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
      traits: published ? {} : { disable: ["published"] },
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
    reporter: createTestReporter(),
  });

  async function sync() {
    await settleChanges(config, {
      check: false,
      failures: await runSync(config),
    });
  }

  return {
    project,
    config,
    sync,
  };
}
