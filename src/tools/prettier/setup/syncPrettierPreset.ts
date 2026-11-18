import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { readJsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import {
  presetSpecifier,
  prettier,
  replacedPresetSpecifier,
} from "#tools/prettier/constants";
import type { LoadedConfig } from "#project/config/index";

/**
 * Points a `package.json` `prettier` key still naming the API subpath to the
 * ready-made config's subpath, leaving any other value.
 */
export async function syncPrettierPreset(config: LoadedConfig) {
  await syncFiles(
    {
      filesystem: config.context.filesystem,
      resolve: config.context.path,
    },
    [
      {
        file: packageJsonFile,
        update(content, path) {
          if (
            readJsonValue(content, path, [prettier]) !== replacedPresetSpecifier
          ) {
            return content;
          }

          return writePackageJsonValue(
            content,
            path,
            [prettier],
            presetSpecifier,
            jsonIndentation,
          );
        },
      },
    ],
  );
}
