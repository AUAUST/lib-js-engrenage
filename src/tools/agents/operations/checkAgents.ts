import { spawnProcess } from "#foundation/processes/index";
import {
  claudeAgentsDir,
  claudeFile,
  claudeSkillsDir,
} from "#tools/agents/claude/constants";
import { codexFile, codexSkillsDir } from "#tools/agents/codex/constants";
import { resolveCodexProfile } from "#tools/agents/codex/index";
import { agentsFile } from "#tools/agents/constants";
import { checkAgentHooks } from "#tools/agents/operations/checkAgentHooks";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { syncFrontmatter } from "#tools/agents/operations/syncFrontmatter";
import type { LoadedConfig } from "#project/config/index";
import type { Agent } from "#tools/agents/types/Agent";
import type { AgentCheckFinding } from "#tools/agents/types/AgentCheckFinding";

export async function checkAgents(
  config: LoadedConfig,
): Promise<AgentCheckFinding[]> {
  const agents = await config.resolve("agents");

  const preferred = agents.preferred ?? [];

  const findings: AgentCheckFinding[] = [];

  if (preferred.length === 0) {
    return findings;
  }

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

  const { filesystem, root } = config.context;

  const templates = await getSkillTemplates({ agents });

  for (const agent of preferred) {
    const instructions = agent === "codex" ? codexFile : claudeFile;

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
      const skillFile = template.files.find((entry) => {
        return (
          entry.file ===
          `${agent === "codex" ? codexSkillsDir : claudeSkillsDir}/${template.name}/SKILL.md`
        );
      });

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

        const foo =
          current.includes(`<!-- @reference ${template.reference} -->`) &&
          (output.frontmatter === undefined ||
            syncFrontmatter(current, output.frontmatter, output.file) ===
              current);

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

    findings.push(...(await checkAgentHooks(filesystem, agent)));

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
