#!/usr/bin/env node

import { createAgentsCommand } from "#agents/commands/createAgentsCommand";
import { Command } from "@commander-js/extra-typings";
import packageJson from "../package.json" with { type: "json" };

const program = new Command("engrenage")
  .description(packageJson.description)
  .version(packageJson.version)
  .addCommand(createAgentsCommand());

await program.parseAsync();
