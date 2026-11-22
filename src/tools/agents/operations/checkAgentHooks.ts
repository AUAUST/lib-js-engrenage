import { array, boolean, looseObject, optional, record, string } from "valibot";

import { readJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import {
  claudeHooks,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { matchesHookEntry } from "#tools/agents/utils/matchesHookEntry";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Agent, AgentCheckFinding } from "#metalbrain/runtimes/index";

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

// @debt checks every preferred runtime against Claude's settings and hooks instead of reading the runtime's own from its `agents.runtimes` contribution
export async function checkAgentHooks(
  filesystem: Filesystem,
  agent: Agent,
): Promise<AgentCheckFinding[]> {
  const findings: AgentCheckFinding[] = [];

  function add(status: AgentCheckFinding["status"], message: string) {
    findings.push({
      agent,
      status,
      message,
    });
  }

  try {
    const content = await filesystem.read(claudeSettingsFile);

    if (content === undefined) {
      add("conflicting", `${claudeSettingsFile}: missing required hooks`);
    } else {
      const present = (
        validate(
          hooksSchema,
          readJsonValue(content, claudeSettingsFile, ["hooks"]),
          `${claudeSettingsFile} hooks`,
        ) ?? {}
      );

      for (const hook of claudeHooks) {
        const found = present[hook.event]?.some((group) => {
          return (
            group.matcher === hook.matcher &&
            group.hooks?.some((entry) => matchesHookEntry(entry, hook))
          );
        });

        add(
          found ? "configured" : "conflicting",
          `${claudeSettingsFile}: ${hook.event} ${hook.matcher} ${found ? "configured" : "missing or outdated generated hook"}`,
        );
      }

      const settings = validate(
        claudeConfigSchema,
        readJsonValue(content, claudeSettingsFile, []),
        claudeSettingsFile,
      );

      if (
        settings.disableAllHooks === true ||
        settings.allowManagedHooksOnly === true
      ) {
        add(
          "disabled",
          `${claudeSettingsFile}: project hooks disabled by disableAllHooks or allowManagedHooksOnly`,
        );
      }
    }
  } catch (error) {
    add("conflicting", error instanceof Error ? error.message : String(error));
  }

  return findings;
}
