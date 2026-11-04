#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import { addDebugOption } from "#cli/operations/addDebugOption";
import { registerSubcommands } from "#cli/operations/registerSubcommands";
import { runProgram } from "#cli/operations/runProgram";
import { engrenage } from "#constants";
import { codegen } from "#scripts/support/codegen/index";
import { pnpm } from "#scripts/support/pnpm";

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
