import { object, optional, string } from "valibot";

import { denyToolUse } from "#tools/agents/operations/denyToolUse";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import {
  checkIssue,
  findBriefedIssue,
  resolveGithubToken,
} from "#tools/github/index";
import { defineCommand } from "#workflows/cli/operations/defineCommand";

const payloadSchema = object({
  tool_input: object({
    subagent_type: optional(string()),
    prompt: optional(string(), ""),
  }),
});

export const dispatch = defineCommand((command) => {
  return command.action(async () => {
    const {
      tool_input: { subagent_type: agent, prompt },
    } = await readHookPayload(payloadSchema, "Claude Code");

    if (agent !== "worker" && agent !== "debugger") {
      return;
    }

    const issue = findBriefedIssue(prompt);

    if (issue === undefined) {
      if (agent === "worker") {
        denyToolUse("brief a worker with `Issue: <owner>/<repo>#<n>`");
      }

      return;
    }

    const findings = await checkIssue(
      { repository: issue.repository, token: await resolveGithubToken() },
      issue.number,
      agent,
    );

    if (findings.length > 0) {
      denyToolUse(
        `#${issue.number} is not ready for a ${agent}:\n${findings.map(({ message }) => `- ${message}`).join("\n")}`,
      );
    }
  });
});
