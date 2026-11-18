import { Option } from "@commander-js/extra-typings";

import { efforts } from "#tools/agents/constants";
import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Run an agent headless in another checkout through the first preferred runtime's own client, under that checkout's instructions, agents, hooks and settings, or resume one of its sessions; block until the run ends, then print the session id and the agent's final report, exiting 1 when the run failed. A headless run cannot prompt: what would prompt is denied and listed.",
      )
      .argument("<directory>", "checkout to run the agent in")
      .addOption(
        new Option(
          "--agent <name>",
          "agent to start, as the checkout defines it",
        ).conflicts("resume"),
      )
      .addOption(
        new Option(
          "--resume <session>",
          "session id an earlier dispatch printed",
        ).conflicts("agent"),
      )
      .requiredOption(
        "--brief <file>",
        "file holding the brief, or the message for a resumed session",
      )
      .addOption(
        new Option(
          "--effort <level>",
          "effort overriding the agent's own",
        ).choices(efforts),
      );
  },
  action() {
    return import("#bin/engrenage/agents/actions/dispatch");
  },
});
