import { flatMap } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { findDirectories } from "#foundation/filesystem/index";
import {
  binSection,
  dataSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
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
          config.resolve(sourceSection),
          config.resolve(binSection),
          config.resolve(scriptsSection),
          config.resolve(testsSection),
          config.resolve(dataSection),
          config.resolve(toolingSection),
          config.context.filesystem,
          config.context.path,
        ]);

        const directories = flatMap(
          [source, bin, scripts, tests, data, tooling],
          ({ dirs }) => dirs,
        );

        args.push(
          ...[
            ...(await findDirectories(filesystem, directories)),
            ...(await filesystem.glob(tooling.files)),
          ].map((path) => resolve(path)),
        );
      },
    },
  },
});
