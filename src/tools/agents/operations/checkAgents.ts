import { spawnProcess } from "#foundation/processes/index";
import {
  formatReferenceMarker,
  listStaleSkillFiles,
  syncFrontmatter,
} from "#metalbrain/instructions/index";
import {
  claudeAgentsDir,
  claudeFile,
  claudeSkillsDir,
} from "#metalbrain/runtimes/constants";
import { loadFormatter } from "#project/format/index";
import { agentsFile } from "#tools/agents/constants";
import { checkAgentHooks } from "#tools/agents/operations/checkAgentHooks";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { formatSkillBody } from "#tools/agents/operations/formatSkillBody";
import { getAgentRuntimes } from "#tools/agents/operations/getAgentRuntimes";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import type { Agent, AgentCheckFinding } from "#metalbrain/runtimes/index";
import type { LoadedConfig } from "#project/config/index";

// @debt matches each runtime's skills and agents directories by hand instead of reading them from its `agents.runtimes` contribution
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

  const extensions = await listActiveExtensions(config);

  const formatter = await loadFormatter(config);

  const templates = await getSkillTemplates({
    agents,
    extensions,
    renderer: await createFragmentRenderer(config),
    runtimes: await getAgentRuntimes(config),
  });

  for (const agent of preferred) {
    for (const required of [agentsFile, claudeFile]) {
      add(
        agent,
        (await filesystem.exists(required)) ? "configured" : "conflicting",
        `${required}: ${(await filesystem.exists(required)) ? "present" : "missing required instructions"}`,
      );
    }

    if (agents.claudeSettings === false) {
      add(
        agent,
        "disabled",
        `${agent} hook synchronization is disabled in engrenage config`,
      );
    }

    for (const template of templates) {
      const skillFile = template.files.find((entry) => {
        return entry.file === `${claudeSkillsDir}/${template.name}/SKILL.md`;
      });

      if (skillFile === undefined) {
        continue;
      }

      const installed = await filesystem.read(skillFile.file);

      let owned = (
        installed?.includes(formatReferenceMarker(template.reference)) === true
      );

      if (!owned) {
        for (const output of template.files) {
          if (!(
            output.file.startsWith(`${claudeSkillsDir}/`) ||
            output.file.startsWith(`${claudeAgentsDir}/`)
          )) {
            continue;
          }

          const current = await filesystem.read(output.file);

          if (current?.includes(formatReferenceMarker(template.reference))) {
            owned = true;
          }
        }
      }

      if (!owned) {
        continue;
      }

      for (const output of template.files.filter((entry) => {
        return (
          entry.file.startsWith(`${claudeSkillsDir}/`) ||
          entry.file.startsWith(`${claudeAgentsDir}/`)
        );
      })) {
        const current = await filesystem.read(output.file);

        const body = await formatSkillBody(output.body, {
          path: output.file,
          config,
          formatter,
        });

        const valid = (
          current !== undefined &&
          current.includes(formatReferenceMarker(output.reference)) &&
          (output.frontmatter === undefined ||
            syncFrontmatter(current, output.frontmatter, output.file) ===
              current) &&
          current.includes(body.trim())
        );

        add(
          agent,
          valid ? "configured" : "conflicting",
          `${output.file}: ${valid ? "generated output current" : "missing or conflicting generated output; sync agents"}`,
        );
      }

      for (const file of await listStaleSkillFiles(
        filesystem,
        skillFile.file,
        template,
      )) {
        add(
          agent,
          "conflicting",
          `${file}: stale supporting file of a shipped skill; sync agents`,
        );
      }
    }

    findings.push(...(await checkAgentHooks(filesystem, agent)));

    const version = await spawnProcess(agent, ["--version"], {
      cwd: root,
    });

    if (version.status !== 0) {
      add(
        agent,
        "unsupported",
        `${agent}: client version unavailable (${version.error?.message ?? version.stderr.trim()}); install a supported local client`,
      );
    } else {
      // @debt hardcodes the inspected client versions, so every newer client reports runtime-unverified until someone edits them
      const inspected = /\b2\.1\.318\b/.test(version.stdout);

      add(
        agent,
        inspected ? "configured" : "runtime-unverified",
        `${version.stdout.trim()}: ${inspected ? "local capability inspection recorded; native hook execution remains unverified" : "no established compatibility evidence; run a disposable native dispatch/stop check"}`,
      );
    }

    add(
      agent,
      "runtime-unverified",
      "Verify project hooks in the native client; file presence cannot establish effective user/system settings or execution.",
    );
  }

  return findings;
}
