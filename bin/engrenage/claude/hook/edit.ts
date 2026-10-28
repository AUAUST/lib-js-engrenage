import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { object, string } from "valibot";

import { loadConfig } from "#config/utils/loadConfig";
import { eslint, prettier } from "#constants";
import { defaultCacheLocation } from "#eslint/constants";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { resolveBinary } from "#support/commander/utils/resolveBinary";
import { isWithin } from "#support/filesystem/utils/isWithin";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { KnownPackageName } from "#types/KnownPackageName";

const payloadSchema = object({
  tool_input: object({
    file_path: string(),
  }),
});

const blockingExitCode = 2;

function runTool(
  config: ResolvedConfig,
  packageName: KnownPackageName,
  args: readonly string[],
) {
  const result = spawnSync(
    process.execPath,
    [resolveBinary(config, packageName, packageName), ...args],
    {
      cwd: config.root,
      encoding: "utf-8",
    },
  );

  if (result.error !== undefined) {
    throw new Error(`Cannot run ${packageName}`, {
      cause: result.error,
    });
  }

  return result;
}

export const edit = defineCommand((command) => {
  return command
    .description(
      "Fix, format and lint the file an edit touched, reading the PostToolUse payload from stdin.",
    )
    .action(async () => {
      const {
        tool_input: { file_path: file },
      } = validate(
        payloadSchema,
        JSON.parse(readFileSync(0, "utf-8")),
        "Claude Code hook payload",
      );

      const config = await loadConfig();

      if (!isWithin(config.root, file)) {
        return;
      }

      const { hasDependency } = config.environment;

      const hasEslint = hasDependency(eslint);

      const lintArgs = [
        "--no-warn-ignored",
        "--cache",
        "--cache-location",
        config.resolve(defaultCacheLocation),
        file,
      ];

      if (hasEslint) {
        runTool(config, eslint, ["--fix", ...lintArgs]);
      }

      if (hasDependency(prettier)) {
        runTool(config, prettier, ["--write", "--ignore-unknown", file]);
      }

      if (!hasEslint) {
        return;
      }

      const { status, stdout, stderr } = runTool(config, eslint, lintArgs);

      if (!(status !== 0)) {
        return;
      }

      process.stderr.write(stdout + stderr);
      process.exitCode = blockingExitCode;
    });
});
