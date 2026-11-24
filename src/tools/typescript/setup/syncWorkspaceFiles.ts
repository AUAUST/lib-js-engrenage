import { emptyObjectFile } from "#foundation/json/constants";
import { readSelectedLanguage } from "#project/environments/index";
import { jsonIndentation } from "#project/format/constants";
import { accessByVisibility } from "#project/package/constants";
import {
  writePackageJsonValue,
  type PackageJson,
  type PublishAccess,
} from "#project/package/index";
import { toJsonValue } from "#project/tsconfig/index";
import { typescript } from "#tools/typescript/constants";
import { createBundledImport } from "#tools/typescript/utils/createBundledImport";
import type { JsonValue } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedWorkspace } from "#project/workspaces/index";

const selfImportKey = "#self/*";

const selfImportStem = "./src/*";

interface Field {
  location: readonly [string] | readonly [string, string];
  value: JsonValue;
}

function createPackageFields(
  { optional: { version, license } }: PackageJson,
  { name }: ResolvedWorkspace,
  access: PublishAccess | undefined,
  extensions: readonly string[],
): Field[] {
  const fields: Field[] = [
    { location: ["name"], value: name },
    { location: ["private"], value: true },
  ];

  if (access !== undefined) {
    fields.push({
      location: ["publishConfig", "access"],
      value: access,
    });
  }

  if (version !== undefined) {
    fields.push({ location: ["version"], value: version });
  }

  if (license !== undefined) {
    fields.push({ location: ["license"], value: license });
  }

  fields.push({
    location: ["imports", selfImportKey],
    value: toJsonValue(
      createBundledImport(selfImportStem, extensions),
      "the workspace self imports",
    ),
  });

  return fields;
}

export async function syncWorkspaceFiles(config: LoadedConfig) {
  const [
    groups,
    filesystem,
    resolvePath,
    packageJson,
    traits,
    visibility,
    language,
  ] = await Promise.all([
    config.resolve("workspaces"),
    config.context.filesystem,
    config.context.path,
    config.resolve("packageJson"),
    config.resolve("traits"),
    config.resolve("visibility"),
    readSelectedLanguage(config, typescript),
  ]);

  const extensions = language?.extensions ?? [];

  const access = traits.published ? accessByVisibility[visibility] : undefined;

  for (const group of groups) {
    for (const workspace of group.workspaces) {
      const packageFile = workspace.packageJson;
      const packagePath = resolvePath(packageFile);

      await filesystem.write(
        packageFile,
        createPackageFields(packageJson, workspace, access, extensions).reduce(
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
    }
  }
}
