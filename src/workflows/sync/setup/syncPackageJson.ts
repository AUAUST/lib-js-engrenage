import { deduplicate } from "@auaust/primitive-kit/arrays";
import { max } from "@auaust/toolkit/math";
import { entries } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { jsonIndentation } from "#project/format/constants";
import { accessByVisibility } from "#project/package/constants";
import {
  createPackageJson,
  writePackageJsonValue,
} from "#project/package/index";
import { listPnpmWarnings } from "#tools/pnpm/index";
import { resolveCommandFiles } from "#tools/tsdown/index";
import type { JsonValue } from "#foundation/json/index";
import type { Runtime } from "#project/baseline/index";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedBin, ResolvedSource } from "#project/environments/index";

interface Field {
  location: readonly [string] | readonly [string, string];
  value: JsonValue;
}

function toNodeMajor(runtime: Runtime): number {
  return runtime.kind === "node" ? runtime.major : runtime.node;
}

function createEnginesFields({
  bin,
  src,
}: {
  bin: ResolvedBin;
  src: ResolvedSource;
}): Field[] {
  const majors = [
    ...(bin.active && bin.runtime !== undefined
      ? [toNodeMajor(bin.runtime)]
      : []),
    ...(src.runtime === undefined ? [] : [toNodeMajor(src.runtime)]),
  ];

  return majors.length === 0
    ? []
    : [
        {
          location: ["engines", "node"],
          value: `>=${max(...majors)}`,
        },
      ];
}

async function createPublishedFields(config: LoadedConfig): Promise<Field[]> {
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

  const files = deduplicate([
    directory,
    ...data.dirs,
    ...(sourcemap ? source.dirs : []),
  ]);

  const commands = entries(
    await resolveCommandFiles(
      {
        bin,
        roles: roles.bin,
        filesystem,
      },
      directory,
    ),
  ).map(([command, file]): Field => {
    return {
      location: ["bin", command],
      value: file,
    };
  });

  return [{ location: ["files"], value: files }, ...commands];
}

async function createFields(config: LoadedConfig): Promise<Field[]> {
  const { resolve } = config;

  const { node } = await resolve("runtime");

  const runtime: Field = {
    location: ["devEngines", "runtime"],
    value: {
      name: "node",
      version: String(node),
      onFail: "error",
    },
  };

  const traits = await resolve("traits");

  if (!traits.published) {
    return [runtime, { location: ["private"], value: true }];
  }

  return [
    runtime,
    {
      location: ["publishConfig", "access"],
      value: accessByVisibility[await resolve("visibility")],
    },
    ...createEnginesFields({
      bin: await resolve("bin"),
      src: await resolve("src"),
    }),
    ...(await createPublishedFields(config)),
  ];
}

export async function syncPackageJson(config: LoadedConfig) {
  const { context } = config;

  const root = context.root;

  const fields = await createFields(config);

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
            console.warn(`${packageJsonFile}: ${warning}`);
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
