import { array, boolean, looseObject, optional, record, string } from "valibot";

import { readJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import {
  claudeHooks,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { matchesHookEntry } from "#tools/agents/utils/matchesHookEntry";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Agent } from "#tools/agents/types/Agent";
import type { AgentCheckFinding } from "#tools/agents/types/AgentCheckFinding";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";

// @debt duplicates the hooks schema of syncHooks
const hooksSchema = optional(
  record(
    string(),
    array(
      looseObject({
        matcher: optional(string()),
        hooks: optional(
          array(
            looseObject({
              command: optional(string()),
              if: optional(string()),
              onFailure: optional(string()),
              async: optional(boolean()),
            }),
          ),
        ),
      }),
    ),
  ),
);

const claudeConfigSchema = looseObject({
  disableAllHooks: optional(boolean()),
  allowManagedHooksOnly: optional(boolean()),
});

export async function checkAgentHooks(
  filesystem: Filesystem,
  agent: Agent,
): Promise<AgentCheckFinding[]> {
  const findings: AgentCheckFinding[] = [];

  const file = claudeSettingsFile;

  const hooks: readonly HookDefinition[] = claudeHooks;

  function add(
    agent: Agent,
    status: AgentCheckFinding["status"],
    message: string,
  ) {
    findings.push({
      agent,
      status,
      message,
    });
  }

  try {
    const content = await filesystem.read(file);

    if (content === undefined) {
      add(agent, "conflicting", `${file}: missing required hooks`);
    } else {
      const present = (
        validate(
          hooksSchema,
          readJsonValue(content, file, ["hooks"]),
          `${file} hooks`,
        ) ?? {}
      );

      for (const hook of hooks) {
        const found = present[hook.event]?.some((group) => {
          return (
            group.matcher === hook.matcher &&
            group.hooks?.some((entry) => matchesHookEntry(entry, hook))
          );
        });

        add(
          agent,
          found ? "configured" : "conflicting",
          `${file}: ${hook.event} ${hook.matcher} ${found ? "configured" : "missing or outdated generated hook"}`,
        );
      }

      const settings = validate(
        claudeConfigSchema,
        readJsonValue(content, file, []),
        file,
      );

      if (
        settings.disableAllHooks === true ||
        settings.allowManagedHooksOnly === true
      ) {
        add(
          agent,
          "disabled",
          `${file}: project hooks disabled by disableAllHooks or allowManagedHooksOnly`,
        );
      }
    }
  } catch (error) {
    add(
      agent,
      "conflicting",
      error instanceof Error ? error.message : String(error),
    );
  }

  return findings;
}
