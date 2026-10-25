#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import codegen from "#bin/support/codegen/index";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

const program = registerSubcommands(
  new Command("support").description(
    "Maintain generated sources of @auaust/engrenage itself.",
  ),
  {
    codegen,
  },
);

await program.parseAsync();
