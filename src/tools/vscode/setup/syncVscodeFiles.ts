import { array, optional, string } from "valibot";

import {
  deduplicate,
  flatMap,
  includes,
  map,
} from "@auaust/primitive-kit/arrays";

import { emptyObjectFile } from "#foundation/json/constants";
import {
  applyJsonEdits,
  flattenJsonObject,
  readJsonValue,
  writeJsonValue,
  type JsonEdit,
} from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { environmentSection, type LoadedConfig } from "#project/config/index";
import { jsonIndentation } from "#project/format/constants";
import { loadInfoRules } from "#tools/eslint/index";
import {
  eslintIntegration,
  extensionsFile,
  settingsFile,
} from "#tools/vscode/constants";
import { vscodeSection } from "#tools/vscode/operations/vscodeSection";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Integration } from "#tools/vscode/types/Integration";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function addRecommendations(
  content: string,
  path: File,
  extensions: readonly string[],
): string {
  const recommendations = validate(
    optional(array(string())),
    readJsonValue(content, path, ["recommendations"]),
    `${path} recommendations`,
  );

  let synced = content;

  for (const extension of extensions) {
    if (!includes(recommendations ?? [], extension)) {
      synced = writeJsonValue(
        synced,
        path,
        ["recommendations", -1],
        extension,
        jsonIndentation,
        { isArrayInsertion: true },
      );
    }
  }

  return synced;
}

async function isEnabled(
  filesystem: Filesystem,
  file: File,
  configured: boolean | undefined,
  requested: boolean,
): Promise<boolean> {
  if (configured === false) {
    return false;
  }

  return configured === true || requested || (await filesystem.exists(file));
}

async function createSettingsEdits(
  root: Directory,
  applicable: readonly Integration[],
): Promise<JsonEdit[]> {
  const infoRules = includes(applicable, eslintIntegration)
    ? await loadInfoRules(root)
    : [];

  return flatMap(applicable, (integration) => {
    const edits = flattenJsonObject(integration.settings);

    if (integration !== eslintIntegration) {
      return edits;
    }

    return [
      ...edits,
      {
        path: ["eslint.rules.customizations"],
        value: map(infoRules, (rule) => {
          return {
            rule,
            severity: "info",
          };
        }),
      },
    ];
  });
}

export async function syncVscodeFiles(
  config: LoadedConfig,
  {
    settings = false,
    extensions = false,
  }: {
    settings?: boolean;
    extensions?: boolean;
  } = {},
) {
  const [root, filesystem, resolve, environment, vscode] = await Promise.all([
    config.context.root,
    config.context.filesystem,
    config.context.path,
    config.resolve(environmentSection),
    config.resolve(vscodeSection),
  ]);

  const applicable = findIntegrations(environment.hasDependency);

  const recommendations = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  if (await isEnabled(filesystem, settingsFile, vscode.settings, settings)) {
    await filesystem.write(
      settingsFile,
      applyJsonEdits(
        (await filesystem.read(settingsFile)) ?? emptyObjectFile,
        resolve(settingsFile),
        await createSettingsEdits(root, applicable),
        jsonIndentation,
      ),
    );
  }

  if (
    await isEnabled(filesystem, extensionsFile, vscode.extensions, extensions)
  ) {
    await filesystem.write(
      extensionsFile,
      addRecommendations(
        (await filesystem.read(extensionsFile)) ?? emptyObjectFile,
        resolve(extensionsFile),
        recommendations,
      ),
    );
  }
}
