import { toArray } from "@auaust/toolkit/array";
import { concat, unique } from "@auaust/toolkit/iterable";
import { max } from "@auaust/toolkit/math";
import { entries, getOwn } from "@auaust/toolkit/object";

import { noRoles } from "#batiment/roles/constants";
import { rootScope } from "#batiment/scopes/constants";
import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { findDirectories } from "#foundation/filesystem/index";
import { listNamespaceEnvironments } from "#project/environments/index";
import { jsonIndentation } from "#project/format/constants";
import {
  createPackageJson,
  createScopeFields,
  writePackageJsonValue,
  type PackageField,
} from "#project/package/index";
import { resolveScopeExports } from "#project/structure/index";
import { listPnpmWarnings } from "#tools/pnpm/index";
import { resolveCommandFiles } from "#tools/tsdown/index";
import type { Runtime } from "#project/baseline/index";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedTraits } from "#project/presets/index";

const privateFields = ["publishConfig", "exports"] as const;

function toNodeMajor(runtime: Runtime): number {
  return runtime.kind === "node" ? runtime.major : runtime.node;
}

async function createEnginesFields(
  config: LoadedConfig,
): Promise<PackageField[]> {
  const [names, execution] = await Promise.all([
    listNamespaceEnvironments(config, (kind) => kind.code === "published"),
    config.resolve("environments.execution"),
  ]);

  const majors = names.flatMap((name) => {
    const runtime = getOwn(execution, name)?.runtime;

    return runtime === undefined ? [] : toNodeMajor(runtime);
  });

  return majors.length === 0
    ? []
    : [
        {
          location: ["engines", "node"],
          value: `>=${max(...majors)}`,
        },
      ];
}

async function createPublishedFields(
  config: LoadedConfig,
): Promise<PackageField[]> {
  const { resolve, context } = config;

  const { sourcemap } = await resolve("build");

  const directory = await resolve("build.outDir");

  if (directory === undefined) {
    return [];
  }

  const [data, source, bin, roles, filesystem] = await Promise.all([
    resolve("data"),
    resolve("src"),
    resolve("bin"),
    resolve("environmentRoles"),
    context.filesystem,
  ]);

  const shipped = await findDirectories(
    filesystem,
    toArray(concat(data.dirs, sourcemap ? source.dirs : [])),
  );

  const files = toArray(unique(concat([directory], shipped)));

  const commands = entries(
    await resolveCommandFiles(
      {
        bin,
        roles: roles.bin ?? noRoles,
        filesystem,
      },
      directory,
    ),
  ).map(([command, file]): PackageField => {
    return {
      location: ["bin", command],
      value: file,
    };
  });

  return [{ location: ["files"], value: files }, ...commands];
}

async function createFields(
  config: LoadedConfig,
  traits: ResolvedTraits,
): Promise<PackageField[]> {
  const { resolve } = config;

  const [{ node }, name, visibility] = await Promise.all([
    resolve("runtime"),
    resolve("name"),
    resolve("visibility"),
  ]);

  const fields = createScopeFields({
    name,
    node,
    published: traits.published,
    visibility,
  });

  // @debt an unpublished root no workspace imports any more keeps the `exports` sync last wrote, then warned about as hand-set
  if (!traits.published) {
    const scopeExports = await resolveScopeExports(config);

    const exports = scopeExports.get(rootScope);

    return [
      ...fields,
      ...(exports === undefined
        ? []
        : [{ location: ["exports"], value: exports } as const]),
    ];
  }

  return [
    ...fields,
    ...(await createEnginesFields(config)),
    ...(await createPublishedFields(config)),
  ];
}

export async function syncPackageJson(config: LoadedConfig) {
  const { context } = config;

  const root = context.root;

  const traits = await config.resolve("traits");

  const fields = await createFields(config, traits);

  await syncFiles(
    {
      filesystem: context.filesystem,
      resolve: context.path,
    },
    [
      {
        file: packageJsonFile,
        update(content, path) {
          const packageJson = createPackageJson({
            root,
            path,
            content,
          });

          for (const warning of listPnpmWarnings(packageJson)) {
            context.reporter.warn(warning, { source: packageJsonFile });
          }

          if (!traits.published) {
            const written = new Set(
              fields.map(({ location: [field] }) => field),
            );

            for (const field of privateFields) {
              if (
                !written.has(field) &&
                packageJson.optional[field] !== undefined
              ) {
                context.reporter.warn(
                  `package.json: ${field} is set, but the config resolves without the \`published\` trait, so sync treats the package as private; set a preset carrying that trait`,
                  { source: packageJsonFile },
                );
              }
            }
          }

          return fields.reduce((current, { location, value }) => {
            return writePackageJsonValue(
              current,
              path,
              location,
              value,
              jsonIndentation,
            );
          }, content);
        },
      },
    ],
  );
}
