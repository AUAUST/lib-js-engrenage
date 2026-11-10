import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { entries } from "@auaust/toolkit/object";

import { emptyObjectFile } from "#foundation/json/constants";
import {
  applyJsonEdits,
  type JsonEdit,
  type JsonValue,
} from "#foundation/json/index";
import {
  resolveListOption,
  type ManagedListOption,
} from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { accessByVisibility } from "#project/package/constants";
import {
  writePackageJsonValue,
  type PackageJson,
  type PublishAccess,
} from "#project/package/index";
import {
  isLeftAlone,
  toJsonValue,
  toTsconfigGlobs,
  toTsconfigSpecifier,
} from "#project/tsconfig/index";
import { selfImports } from "#project/workspaces/constants";
import type { LoadedConfig } from "#project/config/index";
import type {
  ResolvedWorkspace,
  ResolvedWorkspaceGroup,
} from "#project/workspaces/index";

interface Field {
  location: readonly [string] | readonly [string, string];
  value: JsonValue;
}

function createPackageFields(
  { optional: { version, license } }: PackageJson,
  { name }: ResolvedWorkspace,
  access: PublishAccess | undefined,
): Field[] {
  const fields: Field[] = [
    { location: ["name"], value: name },
    { location: ["private"], value: true },
  ];

  if (access !== undefined) {
    fields.push({ location: ["publishConfig", "access"], value: access });
  }

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

async function createTsconfigEdits(
  config: LoadedConfig,
  { tsconfig: option }: ResolvedWorkspaceGroup,
  { tsconfig, globs }: ResolvedWorkspace,
): Promise<JsonEdit[]> {
  const typescript = await config.resolve("typescript");

  const base = typescript.tsconfig.file;

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
        value: path[0] === "extends" && items.length === 1
          ? items[0]
          : [...items],
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

export async function syncWorkspaceFiles(config: LoadedConfig) {
  const [
    groups,
    filesystem,
    resolvePath,
    packageJson,
    traits,
    visibility,
  ] = await Promise.all([
    config.resolve("workspaces"),
    config.context.filesystem,
    config.context.path,
    config.resolve("packageJson"),
    config.resolve("traits"),
    config.resolve("visibility"),
  ]);

  const access = traits.published ? accessByVisibility[visibility] : undefined;

  for (const group of groups) {
    for (const workspace of group.workspaces) {
      const packageFile = workspace.packageJson;
      const packagePath = resolvePath(packageFile);

      await filesystem.write(
        packageFile,
        createPackageFields(packageJson, workspace, access).reduce(
          (current, { location, value }) => {
            return writePackageJsonValue(
              current,
              packagePath,
              location,
              value,
              jsonIndentation,
            );
          },
          (await filesystem.read(packageFile)) ?? emptyObjectFile,
        ),
      );

      await filesystem.write(
        workspace.tsconfig,
        applyJsonEdits(
          (await filesystem.read(workspace.tsconfig)) ?? emptyObjectFile,
          workspace.tsconfig,
          await createTsconfigEdits(config, group, workspace),
          jsonIndentation,
        ),
      );
    }
  }
}
