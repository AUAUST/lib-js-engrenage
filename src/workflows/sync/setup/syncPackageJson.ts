import { deduplicate } from "@auaust/primitive-kit/arrays";
import { max } from "@auaust/toolkit/math";
import { entries } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { buildOutDirSection, buildSection } from "#project/build/index";
import {
  binSection,
  dataSection,
  runtimeSection,
  sourceSection,
  type ResolvedBin,
  type ResolvedSource,
} from "#project/environments/index";
import { jsonIndentation } from "#project/format/constants";
import { accessByVisibility } from "#project/package/constants";
import {
  createPackageJson,
  visibilitySection,
  writePackageJsonValue,
} from "#project/package/index";
import { traitsSection } from "#project/presets/index";
import { environmentRolesSection } from "#project/structure/index";
import { listPnpmWarnings } from "#tools/pnpm/index";
import { resolveCommandFiles } from "#tools/tsdown/index";
import type { JsonValue } from "#foundation/json/index";
import type { Runtime } from "#project/baseline/index";
import type { LoadedConfig } from "#project/config/index";

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
  const { sourcemap } = await resolve(buildSection);
  const directory = await resolve(buildOutDirSection);

  if (directory === undefined) {
    return [];
  }

  const [data, source, bin, roles, filesystem] = await Promise.all([
    resolve(dataSection),
    resolve(sourceSection),
    resolve(binSection),
    resolve(environmentRolesSection),
    context.filesystem,
  ]);

  const files = deduplicate([
    directory,
    ...(data.active ? data.dirs : []),
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

  const { node } = await resolve(runtimeSection);

  const runtime: Field = {
    location: ["devEngines", "runtime"],
    value: {
      name: "node",
      version: String(node),
      onFail: "error",
    },
  };

  const traits = await resolve(traitsSection);

  if (!traits.published) {
    return [runtime, { location: ["private"], value: true }];
  }

  return [
    runtime,
    {
      location: ["publishConfig", "access"],
      value: accessByVisibility[await resolve(visibilitySection)],
    },
    ...createEnginesFields({
      bin: await resolve(binSection),
      src: await resolve(sourceSection),
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
