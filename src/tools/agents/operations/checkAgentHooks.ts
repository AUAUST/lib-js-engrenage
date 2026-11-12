import { parseTOML } from "confbox/toml";
import {
  array,
  boolean,
  looseObject,
  optional,
  record,
  string,
  unknown,
} from "valibot";

import { readJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import {
  claudeHooks,
  claudeSettingsFile,
} from "#tools/agents/claude/constants";
import { codexHooks, codexHooksFile } from "#tools/agents/codex/constants";
import { createHookCommand } from "#tools/agents/utils/createHookCommand";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Agent } from "#tools/agents/types/Agent";
import type { AgentCheckFinding } from "#tools/agents/types/AgentCheckFinding";
import type { HookDefinition } from "#tools/agents/types/HookDefinition";

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
            }),
          ),
        ),
      }),
    ),
  ),
);

const codexConfigSchema = looseObject({
  hooks: optional(unknown()),
  features: optional(
    looseObject({
      hooks: optional(boolean()),
      codex_hooks: optional(boolean()),
    }),
  ),
  allow_managed_hooks_only: optional(boolean()),
});

const claudeConfigSchema = looseObject({
  disableAllHooks: optional(boolean()),
  allowManagedHooksOnly: optional(boolean()),
});

export async function checkAgentHooks(
  filesystem: Filesystem,
  agent: Agent,
): Promise<AgentCheckFinding[]> {
  const findings: AgentCheckFinding[] = [];

  const file = agent === "codex" ? codexHooksFile : claudeSettingsFile;

  const hooks: readonly HookDefinition[] = agent === "codex"
    ? codexHooks
    : claudeHooks;

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
            group.hooks?.some((entry) => {
              return (
                entry.command === createHookCommand(hook.command) &&
                entry.if === hook.condition &&
                entry.onFailure === hook.onFailure
              );
            })
          );
        });

        add(
          agent,
          found ? "configured" : "conflicting",
          `${file}: ${hook.event} ${hook.matcher} ${found ? "configured" : "missing or outdated generated hook"}`,
        );
      }

      if (agent === "claude") {
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
    }

    if (agent === "codex") {
      const native = await filesystem.read(".codex/config.toml");

      if (native !== undefined) {
        const settings = validate(
          codexConfigSchema,
          parseTOML(native),
          ".codex/config.toml",
        );

        if (
          settings.features?.hooks === false ||
          (settings.features?.hooks === undefined &&
            settings.features?.codex_hooks === false) ||
          settings.allow_managed_hooks_only === true
        ) {
          add(
            agent,
            "disabled",
            ".codex/config.toml: project hooks disabled by features.hooks, codex_hooks or allow_managed_hooks_only",
          );
        }

        if (settings.hooks !== undefined && content !== undefined) {
          add(
            agent,
            "conflicting",
            "Codex hooks are defined inline in .codex/config.toml and in .codex/hooks.json; native merging can run duplicates",
          );
        }
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
