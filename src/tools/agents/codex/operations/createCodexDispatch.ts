import { createCodexAgentProfiles } from "#tools/agents/codex/operations/createCodexAgentProfiles";
import type { SkillDefinition } from "#tools/agents/types/SkillDefinition";

export function createCodexDispatch(
  installed: readonly SkillDefinition[],
): string {
  if (installed.length === 0) {
    return "No owned Codex workflow skills are installed.";
  }

  const lines = [
    "Use the installed workflows below when their descriptions match the request.",
    "",
    "| Skill | Handling |",
    "| --- | --- |",
  ];

  for (const template of installed) {
    const { name, description, agent } = template;

    const handling =
      agent === undefined || agent.name === "planner"
        ? "Run its skill in the main session."
        : `Delegate to \`${agent.name}\`.`;

    lines.push(
      `| \`${name}\` | ${handling} ${(agent === undefined || agent.name === "planner" ? description : agent.description).replaceAll("|", "&#124;")} |`,
    );
  }

  const profiles = installed.flatMap(({ agent, reference, body }) => {
    return agent === undefined
      ? []
      : createCodexAgentProfiles({
          agent,
          reference,
          body,
        });
  });

  if (profiles.length > 0) {
    lines.push(
      "",
      "| Profile | Canonical role | Effort |",
      "| --- | --- | --- |",
    );

    for (const profile of profiles) {
      lines.push(
        `| \`${profile.name}\` | \`${profile.role}\` | ${profile.effort ?? "inherited"} |`,
      );
    }

    lines.push(
      "",
      "Spawn the named profile with Codex's spawn_agent tool (agent_type). Profiles inherit the session's selected model; do not supply another model. For a leaf with Complexity Trivial select the role's _low profile; for Complex select _high; otherwise select its unsuffixed profile. A profile's effort takes precedence over a spawn effort override.",
      'Spawn each leaf and the consultant with fork_turns: "none" and a brief containing only task references, relevant decisions and the requested outcome. Use send_input with its id to return questions, review gaps and gate failures to that same agent; use resume_agent first if it is closed. In clients exposing collaboration tools, use spawn_agent with the named role when supported, send_message for a running agent and followup_task for an idle agent. A client without named-profile selection cannot establish profile loading; report that unsupported path.',
    );
  }

  if (profiles.some((profile) => profile.role === "planner")) {
    lines.push(
      "",
      "Use the planner profile only as the walker's consultant, and resume it with its existing id.",
    );
  }

  return lines.join("\n");
}
