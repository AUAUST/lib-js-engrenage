import { deduplicate, includes } from "@auaust/primitive-kit/arrays";
import { max } from "@auaust/toolkit/math";
import { entries } from "@auaust/toolkit/object";

import { syncFiles } from "#blocks/utils/syncFiles";
import { packageJsonFile } from "#constants";
import { createPackageJson } from "#package/utils/createPackageJson";
import { writePackageJsonValue } from "#package/utils/writePackageJsonValue";
// @debt reaches into tools/pnpm, a higher layer than project; the layered registry (#143) removes the upward dependency
import { listPnpmWarnings } from "#pnpm/utils/listPnpmWarnings";
// @debt reaches into tools/tsdown, a higher layer than project; the layered registry (#143) removes the upward dependency
import { resolveCommandFiles } from "#tsdown/utils/resolveCommandFiles";
import type { Runtime } from "#baseline/types/Runtime";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonValue } from "#json/types/JsonValue";

interface Field {
  location: readonly [string] | readonly [string, string];
  value: JsonValue;
}

function toNodeMajor(runtime: Runtime): number {
  return runtime.kind === "node" ? runtime.major : runtime.node;
}

function createEnginesFields({ bin, src }: ResolvedConfig): Field[] {
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

function createPublishedFields(config: ResolvedConfig): Field[] {
  const { outDir, sourcemap } = config.build;

  if (outDir === undefined) {
    return [];
  }

  const files = deduplicate([
    outDir,
    ...(config.data.active ? config.data.dirs : []),
    ...(sourcemap ? config.src.dirs : []),
  ]);

  const commands = entries(resolveCommandFiles(config, outDir)).map(
    ([command, file]): Field => {
      return {
        location: ["bin", command],
        value: file,
      };
    },
  );

  return [{ location: ["files"], value: files }, ...commands];
}

function createFields(config: ResolvedConfig): Field[] {
  const runtime: Field = {
    location: ["devEngines", "runtime"],
    value: {
      name: "node",
      version: String(config.runtime.node),
      onFail: "error",
    },
  };

  return includes(config.presets, "library")
    ? [
        runtime,
        ...createEnginesFields(config),
        ...createPublishedFields(config),
      ]
    : [runtime];
}

export function syncPackageJson(config: ResolvedConfig) {
  syncFiles(config, [
    {
      file: packageJsonFile,
      update(content, path) {
        const packageJson = createPackageJson({
          root: config.root,
          path,
          content,
        });

        for (const warning of listPnpmWarnings(packageJson)) {
          console.warn(`${packageJsonFile}: ${warning}`);
        }

        return createFields(config).reduce((current, { location, value }) => {
          return writePackageJsonValue(current, path, location, value);
        }, content);
      },
    },
  ]);
}
