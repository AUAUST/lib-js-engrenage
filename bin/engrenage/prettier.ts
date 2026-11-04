import { defineToolCommands } from "#cli/operations/defineToolCommands";
import { ensureAnyOf } from "#cli/operations/ensureAnyOf";
import { ensureIncludes } from "#cli/operations/ensureIncludes";
import { ensureIncludesAll } from "#cli/operations/ensureIncludesAll";
import { ensureUnset } from "#cli/operations/ensureUnset";
import { packages } from "#constants";

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

        args.push(config.root);
      },
    },
  },
});
