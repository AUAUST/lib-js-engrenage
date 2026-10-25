#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import agents from "#bin/engrenage/agents/index";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";
import packageJson from "../../package.json" with { type: "json" };

const program = registerSubcommands(
  new Command("engrenage")
    .description(packageJson.description)
    .version(packageJson.version),
  {
    agents,
  },
);

await program.parseAsync();
