import { prettier } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";
import { ensureIncludesAll } from "#support/commander/utils/ensureIncludesAll";
import { ensureUnset } from "#support/commander/utils/ensureUnset";

function formatFiles(args: string[]) {
  ensureAnyOf(
    args,
    ["--check", "-c", "--write", "-w", "--list-different", "-l"],
    "--write",
  );

  ensureIncludes(args, "--ignore-unknown");
}

export default defineToolCommands({
  packageName: prettier,
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
