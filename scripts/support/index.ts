#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import { engrenage } from "#constants";
import { codegen } from "#scripts/support/codegen/index";
import { pnpm } from "#scripts/support/pnpm";
import { addDebugOption } from "#support/commander/utils/addDebugOption";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";
import { runProgram } from "#support/commander/utils/runProgram";

const program = registerSubcommands(
  new Command("support").description(
    `Maintain generated sources of ${engrenage} itself.`,
  ),
  {
    codegen,
    pnpm,
  },
);

addDebugOption(program);

await runProgram(program);
