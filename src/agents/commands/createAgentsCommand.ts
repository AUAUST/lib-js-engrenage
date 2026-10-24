import { createSyncCommand } from "#agents/commands/createSyncCommand";
import { Command } from "@commander-js/extra-typings";

export function createAgentsCommand() {
  return new Command("agents")
    .description("Manage agent instructions shared through @auaust/engrenage.")
    .addCommand(createSyncCommand());
}
