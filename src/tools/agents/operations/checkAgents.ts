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
import { spawnProcess } from "#foundation/processes/index";
import {
  claudeAgentsDir,
  claudeFile,
  claudeHooks,
  claudeSettingsFile,
  claudeSkillsDir,
} from "#tools/agents/claude/constants";
import {
  codexFile,
  codexHooks,
  codexHooksFile,
  codexSkillsDir,
} from "#tools/agents/codex/constants";
import { resolveCodexProfile } from "#tools/agents/codex/index";
import { agentsSection } from "#tools/agents/config/sections/agentsSection";
import { agentsFile } from "#tools/agents/constants";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { syncFrontmatter } from "#tools/agents/operations/syncFrontmatter";
import { createHookCommand } from "#tools/agents/utils/createHookCommand";
import type { LoadedConfig } from "#project/config/index";
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

export async function checkAgents(
  config: LoadedConfig,
): Promise<AgentCheckFinding[]> {
  const agents = await config.resolve(agentsSection);

  const preferred = agents.preferred ?? [];
  const { filesystem, root } = config.context;
  const findings: AgentCheckFinding[] = [];

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

  if (preferred.length === 0) {
    return findings;
  }

  const templates = await getSkillTemplates({ agents });

  for (const agent of preferred) {
    const file = agent === "codex" ? codexHooksFile : claudeSettingsFile;
    const instructions = agent === "codex" ? codexFile : claudeFile;

    const hooks: readonly HookDefinition[] =
      agent === "codex" ? codexHooks : claudeHooks;

    for (const required of [agentsFile, instructions]) {
      add(
        agent,
        (await filesystem.exists(required)) ? "configured" : "conflicting",
        `${required}: ${(await filesystem.exists(required)) ? "present" : "missing required instructions"}`,
      );
    }

    if (
      (agent === "codex" ? agents.codexHooks : agents.claudeSettings) === false
    ) {
      add(
        agent,
        "disabled",
        `${agent} hook synchronization is disabled in engrenage config`,
      );
    }

    for (const template of templates) {
      const skillFile = template.files.find(
        (entry) =>
          entry.file ===
          `${agent === "codex" ? codexSkillsDir : claudeSkillsDir}/${template.name}/SKILL.md`,
      );

      if (skillFile === undefined) {
        continue;
      }

      const installed = await filesystem.read(skillFile.file);

      let owned =
        installed?.includes(`<!-- @reference ${template.reference} -->`) ===
        true;

      if (!owned) {
        for (const output of template.files) {
          if (
            agent === "codex"
              ? !output.file.startsWith(`${codexSkillsDir}/`)
              : !(
                  output.file.startsWith(`${claudeSkillsDir}/`) ||
                  output.file.startsWith(`${claudeAgentsDir}/`)
                )
          ) {
            continue;
          }

          const current = await filesystem.read(output.file);

          if (current?.includes(`<!-- @reference ${template.reference} -->`)) {
            owned = true;
          }
        }

        if (agent === "codex") {
          for (const profile of template.profiles) {
            const current = await filesystem.read(profile.file);

            if (current?.startsWith(profile.provenance)) {
              owned = true;
            }
          }
        }
      }

      if (!owned) {
        continue;
      }

      for (const output of template.files.filter((entry) => {
        return agent === "codex"
          ? entry.file.startsWith(`${codexSkillsDir}/`)
          : entry.file.startsWith(`${claudeSkillsDir}/`) ||
              entry.file.startsWith(`${claudeAgentsDir}/`);
      })) {
        const current = await filesystem.read(output.file);

        const valid =
          current !== undefined &&
          current.includes(`<!-- @reference ${template.reference} -->`) &&
          (output.frontmatter === undefined ||
            syncFrontmatter(current, output.frontmatter, output.file) ===
              current) &&
          current.includes(template.body.trim());

        add(
          agent,
          valid ? "configured" : "conflicting",
          `${output.file}: ${valid ? "generated output current" : "missing or conflicting generated output; sync agents"}`,
        );
      }

      if (agent === "codex") {
        for (const profile of template.profiles) {
          try {
            await resolveCodexProfile(filesystem, profile.name);

            add(
              agent,
              "configured",
              `${profile.file}: generated profile current`,
            );
          } catch (error) {
            add(
              agent,
              "conflicting",
              error instanceof Error ? error.message : String(error),
            );
          }
        }
      }
    }

    try {
      const content = await filesystem.read(file);

      if (content === undefined) {
        add(agent, "conflicting", `${file}: missing required hooks`);
      } else {
        const present =
          validate(
            hooksSchema,
            readJsonValue(content, file, ["hooks"]),
            `${file} hooks`,
          ) ?? {};

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

    const version = await spawnProcess(agent, ["--version"], { cwd: root });

    if (version.status !== 0) {
      add(
        agent,
        "unsupported",
        `${agent}: client version unavailable (${version.error?.message ?? version.stderr.trim()}); install a supported local client`,
      );
    } else {
      const inspected =
        agent === "codex"
          ? /\b0\.159\.2\b/.test(version.stdout)
          : /\b2\.1\.318\b/.test(version.stdout);

      add(
        agent,
        inspected ? "configured" : "runtime-unverified",
        `${version.stdout.trim()}: ${inspected ? "local capability inspection recorded; native hook execution remains unverified" : "no established compatibility evidence; run a disposable native dispatch/stop check"}`,
      );
    }

    add(
      agent,
      "runtime-unverified",
      agent === "codex"
        ? "Review changed project hook definitions with Codex /hooks in a trusted project. File presence cannot establish trust, effective user/system settings, or execution; disabled, skipped and timed-out hooks do not enforce checks."
        : "Verify project hooks in the native client; file presence cannot establish effective user/system settings or execution.",
    );
  }

  return findings;
}
