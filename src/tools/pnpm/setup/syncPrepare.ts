import { isString } from "@auaust/toolkit/string";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { readJsonValue } from "#foundation/json/index";
import { parseShell, type ShellCommand } from "#foundation/shell/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import { restoreLinksCommand } from "#tools/pnpm/constants";
import type { LoadedConfig } from "#project/config/index";

const prepareLocation: [string, string] = ["scripts", "prepare"];

const restoreScript = `pnpm ${restoreLinksCommand}`;

const restoreWords = restoreLinksCommand.split(" ");

function isRestore({ words }: ShellCommand) {
  const texts = words.map((word) => {
    return word.kind === "literal" ? word.text : undefined;
  });

  const command = texts[0] === "pnpm" ? texts.slice(1) : texts;

  return (
    command.length === restoreWords.length &&
    command.every((text, index) => {
      return text === restoreWords[index];
    })
  );
}

/**
 * Makes the root `prepare` script restore the linked checkouts, after any command
 * it already runs, so the `pnpm install` and `pnpm update` replacing them repair
 * them, while registry consumers never run it. Runs engrenage through pnpm, which
 * also finds it in engrenage's own repository.
 */
// @debt a project installed with `--prod` lacks the `engrenage` executable, so its prepare fails the install, as lefthook's `lefthook install` does
export async function syncPrepare(config: LoadedConfig) {
  await syncFiles(
    {
      filesystem: config.context.filesystem,
      resolve: config.context.path,
    },
    [
      {
        file: packageJsonFile,
        update(content, path) {
          const prepare = readJsonValue(content, path, prepareLocation);

          if (prepare !== undefined && !isString(prepare)) {
            throw new Error(`${path} scripts.prepare is no string`);
          }

          if (
            prepare?.includes(restoreLinksCommand) === true &&
            parseShell(prepare).some(isRestore)
          ) {
            return content;
          }

          return writePackageJsonValue(
            content,
            path,
            prepareLocation,
            prepare === undefined
              ? restoreScript
              : `${prepare} && ${restoreScript}`,
            jsonIndentation,
          );
        },
      },
    ],
  );
}
