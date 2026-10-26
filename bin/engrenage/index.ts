#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import sync from "#bin/engrenage/sync";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";
import packageJson from "../../package.json" with { type: "json" };

const program = registerSubcommands(
  new Command("engrenage")
    .description(packageJson.description)
    .version(packageJson.version),
  {
    sync,
  },
);

await program.parseAsync();
