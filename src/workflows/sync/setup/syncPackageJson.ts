import { deduplicate } from "@auaust/primitive-kit/arrays";
import { max } from "@auaust/toolkit/math";
import { entries } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { jsonIndentation } from "#project/format/constants";
import {
  createPackageJson,
  writePackageJsonValue,
} from "#project/package/index";
import { listPnpmWarnings } from "#tools/pnpm/index";
import { resolveCommandFiles } from "#tools/tsdown/index";
import type { JsonValue } from "#foundation/json/index";
import type { OptionContext } from "#foundation/options/index";
import type { Runtime } from "#project/baseline/index";
import type { ProjectConfig } from "#project/config/index";
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

async function createPublishedFields(
  config: OptionContext<ProjectConfig>,
): Promise<Field[]> {
  const { get } = config;
  const { sourcemap, outDir } = await get("build");
  const directory = await outDir;

  if (directory === undefined) {
    return [];
  }

  const [data, source, bin, filesystem] = await Promise.all([
    get("data"),
    get("src"),
    get("bin"),
    get("filesystem"),
  ]);

  const files = deduplicate([
    directory,
    ...(data.active ? data.dirs : []),
    ...(sourcemap ? source.dirs : []),
  ]);

  const commands = entries(
    await resolveCommandFiles({ bin, filesystem }, directory),
  ).map(([command, file]): Field => {
    return {
      location: ["bin", command],
      value: file,
    };
  });

  return [{ location: ["files"], value: files }, ...commands];
}

async function createFields(
  config: OptionContext<ProjectConfig>,
): Promise<Field[]> {
  const { get } = config;

  const { node } = await get("runtime");

  const runtime: Field = {
    location: ["devEngines", "runtime"],
    value: {
      name: "node",
      version: String(node),
      onFail: "error",
    },
  };

  const traits = await get("traits");

  if (!traits.published) {
    return [runtime];
  }

  return [
    runtime,
    ...createEnginesFields({ bin: await get("bin"), src: await get("src") }),
    ...(await createPublishedFields(config)),
  ];
}

export async function syncPackageJson(config: OptionContext<ProjectConfig>) {
  const { get } = config;

  const root = await get("root");
  const fields = await createFields(config);

  await syncFiles(
    {
      filesystem: await get("filesystem"),
      resolve: await get("resolve"),
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
