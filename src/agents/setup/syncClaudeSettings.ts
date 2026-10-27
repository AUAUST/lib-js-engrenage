import { array, looseObject, optional, string } from "valibot";

import {
  claudeSettingsFile,
  editHook,
  editHookCommand,
} from "#agents/constants";
import { emptyObjectFile } from "#support/json/constants";
import { readJsonValue } from "#support/json/utils/readJsonValue";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

const postToolUseSchema = optional(
  array(
    looseObject({
      hooks: optional(
        array(
          looseObject({
            command: optional(string()),
          }),
        ),
      ),
    }),
  ),
);

function addEditHook(content: string, path: File): string {
  const location = ["hooks", "PostToolUse"];

  const entries = validate(
    postToolUseSchema,
    readJsonValue(content, path, location),
    `${path} PostToolUse hooks`,
  );

  const hasEditHook = (entries ?? []).some(({ hooks = [] }) => {
    return hooks.some(({ command }) => {
      return command === editHookCommand;
    });
  });

  if (hasEditHook) {
    return content;
  }

  return writeJsonValue(content, path, [...location, -1], editHook, {
    isArrayInsertion: true,
  });
}

export function syncClaudeSettings(
  config: ResolvedConfig,
  {
    settings = false,
  }: {
    settings?: boolean;
  } = {},
) {
  const { filesystem } = config;

  const configured = config.agents.claudeSettings;

  if (
    configured === false ||
    !(configured === true || settings || filesystem.exists(claudeSettingsFile))
  ) {
    return;
  }

  filesystem.write(
    claudeSettingsFile,
    addEditHook(
      filesystem.read(claudeSettingsFile) ?? emptyObjectFile,
      config.resolve(claudeSettingsFile),
    ),
  );
}
