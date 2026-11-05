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
      arguments(config, args) {
        formatFiles(args);
      },
    },
    "prettier:check": {
      message: "Checking formatting...",
      arguments(config, args) {
        ensureUnset(args, ["--write", "-w"]);

        ensureIncludesAll(args, [["--check", "-c"], "--ignore-unknown"]);
      },
    },
    "prettier:all": {
      async arguments(config, args) {
        formatFiles(args);

        const [
          source,
          bin,
          scripts,
          tests,
          data,
          tooling,
          filesystem,
          resolve,
        ] = await Promise.all([
          config.get("src"),
          config.get("bin"),
          config.get("scripts"),
          config.get("tests"),
          config.get("data"),
          config.get("tooling"),
          config.get("filesystem"),
          config.get("resolve"),
        ]);

        const directories = flatMap(
          [source, bin, scripts, tests, data, tooling],
          ({ dirs }) => dirs,
        );

        args.push(
          ...[
            ...directories.filter((directory) => {
              return filesystem.isDirectory(directory);
            }),
            ...filesystem.glob(tooling.files),
          ].map((path) => resolve(path)),
        );
      },
    },
  },
});
