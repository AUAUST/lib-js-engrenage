import { deduplicate } from "@auaust/primitive-kit/arrays";
import { max } from "@auaust/toolkit/math";
import { entries } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/operations/syncFiles";
import { jsonIndentation } from "#project/format/constants";
import {
  createPackageJson,
  writePackageJsonValue,
} from "#project/package/index";
import { listPnpmWarnings } from "#tools/pnpm/index";
import { resolveCommandFiles } from "#tools/tsdown/index";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { Runtime } from "#project/baseline/types/Runtime";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";

interface Field {
  location: readonly [string] | readonly [string, string];
  value: JsonValue;
}

function toNodeMajor(runtime: Runtime): number {
  return runtime.kind === "node" ? runtime.major : runtime.node;
}

function createEnginesFields({ bin, src }: ProjectConfig): Field[] {
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

function createPublishedFields(config: ProjectConfig): Field[] {
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

function createFields(config: ProjectConfig): Field[] {
  const runtime: Field = {
    location: ["devEngines", "runtime"],
    value: {
      name: "node",
      version: String(config.runtime.node),
      onFail: "error",
    },
  };

  return config.traits.published
    ? [
        runtime,
        ...createEnginesFields(config),
        ...createPublishedFields(config),
      ]
    : [runtime];
}

export function syncPackageJson(config: ProjectConfig) {
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
  ]);
}
