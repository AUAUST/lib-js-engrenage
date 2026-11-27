import { efforts } from "#metalbrain/runtimes/constants";
import { argument, command, option } from "#nexus/cli/index";

import rules from "#bin/metalbrain/agents/rules/index";
import skills from "#bin/metalbrain/agents/skills/index";

export default command({
  name: "agents",
  description: "Check agent integration, dispatch agents, report their runs and install shared rules and skills.",
  subcommands: [
    command({
      name: "check",
      description: "Check local agent integration without changing settings.",
      action() {
        return import("#bin/metalbrain/agents/actions/check");
      },
    }),
    command({
      name: "dispatch",
      description: "Run an agent headless in another checkout through the client the caller names, under that checkout's instructions, agents, hooks and settings, or resume one of its sessions; block until the run ends, then print the session id and the agent's final report, exiting 1 when the run failed. A headless run cannot prompt: what would prompt is denied and listed.",
      arguments: [
        argument({
          name: "directory",
          description: "checkout to run the agent in",
        }),
      ],
      options: [
        option({
          name: "client",
          type: "string",
          placeholder: "runtime",
          description: "agent runtime whose client runs the agent, as `agents.runtimes` names it: the dispatching session's own unless the user asks for another",
          required: true,
        }),
        option({
          name: "agent",
          type: "string",
          placeholder: "name",
          description: "agent to start, as the checkout defines it",
          conflicts: ["resume"],
        }),
        option({
          name: "resume",
          type: "string",
          placeholder: "session",
          description: "session id an earlier dispatch printed",
          conflicts: ["agent"],
        }),
        option({
          name: "brief",
          type: "string",
          placeholder: "file",
          description: "file holding the brief, or the message for a resumed session",
          required: true,
        }),
        option({
          name: "effort",
          type: "string",
          placeholder: "level",
          description: "effort overriding the agent's own",
          choices: efforts,
        }),
      ],
      action() {
        return import("#bin/metalbrain/agents/actions/dispatch");
      },
    }),
    rules,
    skills,
    command({
      name: "stats",
      description: "Report the recorded agent runs of a session by role and by agent, with token counts weighted into units: the current Claude session by default, else the latest recorded one.",
      arguments: [
        argument({
          name: "session",
          description: "session id",
          optional: true,
        }),
      ],
      options: [
        option({
          name: "all",
          type: "boolean",
          description: "aggregate the runs of every session by role, model and day",
          default: false,
        }),
        option({
          name: "since",
          type: "string",
          placeholder: "date",
          description: "aggregate the runs started on or after this date by role, model and day",
        }),
        option({
          name: "outcome",
          type: "boolean",
          description: "aggregate the runs of every session, or those since --since, by hand-back outcome and by role with outcome",
          default: false,
        }),
      ],
      action() {
        return import("#bin/metalbrain/agents/actions/stats");
      },
    }),
  ],
});
