import { flatMap } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";
import { ensureIncludesAll } from "#workflows/cli/operations/ensureIncludesAll";
import { ensureUnset } from "#workflows/cli/operations/ensureUnset";

function formatFiles(args: string[]) {
  ensureAnyOf(
    args,
    ["--check", "-c", "--write", "-w", "--list-different", "-l"],
    "--write",
  );

  ensureIncludes(args, "--ignore-unknown");
}

export const prettier = defineToolCommands({
  packageName: packages.prettier,
  commands: {
    "prettier": {
      description: "Format the given files.",
      aliases: "format",
      arguments(config, args) {
        formatFiles(args);
      },
    },
    "prettier:check": {
      description: "Check the formatting of the given files.",
      message: "Checking formatting...",
      arguments(config, args) {
        ensureUnset(args, ["--write", "-w"]);

        ensureIncludesAll(args, [["--check", "-c"], "--ignore-unknown"]);
      },
    },
    "prettier:all": {
      description: "Format the whole project.",
      aliases: "format:all",
      arguments(config, args) {
        formatFiles(args);

        const directories = flatMap(
          [
            config.src,
            config.bin,
            config.scripts,
            config.tests,
            config.data,
            config.tooling,
          ],
          ({ dirs }) => dirs,
        );

        args.push(
          ...[
            ...directories.filter((directory) => {
              return config.filesystem.isDirectory(directory);
            }),
            ...config.filesystem.glob(config.tooling.files),
          ].map((path) => config.resolve(path)),
        );
      },
    },
  },
});
