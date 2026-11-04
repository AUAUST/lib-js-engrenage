import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { entries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { resolveListOption } from "#foundation/options/utils/resolveListOption";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/operations/writePackageJsonValue";
import {
  isLeftAlone,
  toJsonValue,
  toTsconfigGlobs,
  toTsconfigSpecifier,
} from "#project/tsconfig/index";
import { selfImports } from "#project/workspaces/constants";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { JsonValue } from "#foundation/json/types/JsonValue";
import type { ManagedListOption } from "#foundation/options/types/ManagedListOption";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { ResolvedWorkspace } from "#project/workspaces/types/ResolvedWorkspace";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/types/ResolvedWorkspaceGroup";

interface Field {
  location: readonly [string] | readonly [string, string];
  value: JsonValue;
}

function createPackageFields(
  { packageJson }: ProjectConfig,
  { name }: ResolvedWorkspace,
): Field[] {
  const { version, license } = packageJson.optional;

  const fields: Field[] = [
    { location: ["name"], value: name },
    { location: ["private"], value: true },
  ];

  if (version !== undefined) {
    fields.push({ location: ["version"], value: version });
  }

  if (license !== undefined) {
    fields.push({ location: ["license"], value: license });
  }

  for (const [key, value] of entries(selfImports)) {
    fields.push({
      location: ["imports", key],
      value: toJsonValue(value, "the workspace self imports"),
    });
  }

  return fields;
}

function isManaged(option: ManagedListOption<string> | undefined): boolean {
  return option !== undefined && !isBoolean(option);
}

function createTsconfigEdits(
  config: ProjectConfig,
  { tsconfig: option }: ResolvedWorkspaceGroup,
  { tsconfig, globs }: ResolvedWorkspace,
): JsonEdit[] {
  const base = config.typescript.tsconfig.file;

  const lists = [
    [
      ["extends"],
      option.extends,
      () => {
        return base === undefined ? [] : [toTsconfigSpecifier(tsconfig, base)];
      },
    ],
    [["include"], option.include, () => toTsconfigGlobs(tsconfig, globs)],
    [["exclude"], option.exclude, () => []],
    [["compilerOptions", "lib"], option.lib, () => []],
    [["compilerOptions", "types"], option.types, () => []],
  ] as const;

  const derived = flatMap(lists, ([path, listed, defaults]): JsonEdit[] => {
    const items = resolveListOption(
      listed,
      defaults,
      `workspaces tsconfig.${path.join(".")}`,
    );

    if (items === false || (items.length === 0 && !isManaged(listed))) {
      return [];
    }

    return [
      {
        path: [...path],
        value:
          path[0] === "extends" && items.length === 1 ? items[0] : [...items],
      },
    ];
  });

  const custom = map(
    entries(option.compilerOptions),
    ([name, value]): JsonEdit => {
      return {
        path: ["compilerOptions", name],
        value: toJsonValue(value, `workspaces compilerOptions.${name}`),
      };
    },
  );

  return [...derived, ...custom].filter((edit) => {
    return !isLeftAlone(edit, option.unmanaged);
  });
}

export function syncWorkspaceFiles(config: ProjectConfig) {
  for (const group of config.workspaces) {
    for (const workspace of group.workspaces) {
      const packageFile = workspace.packageJson;
      const packagePath = config.resolve(packageFile);

      config.filesystem.write(
        packageFile,
        createPackageFields(config, workspace).reduce(
          (current, { location, value }) => {
            return writePackageJsonValue(
              current,
              packagePath,
              location,
              value,
              jsonIndentation,
            );
          },
          config.filesystem.read(packageFile) ?? emptyObjectFile,
        ),
      );

      config.filesystem.write(
        workspace.tsconfig,
        applyJsonEdits(
          config.filesystem.read(workspace.tsconfig) ?? emptyObjectFile,
          workspace.tsconfig,
          createTsconfigEdits(config, group, workspace),
          jsonIndentation,
        ),
      );
    }
  }
}
