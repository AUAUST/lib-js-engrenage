#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import { engrenage } from "#constants";
import { codegen } from "#scripts/support/codegen/index";
import { pnpm } from "#scripts/support/pnpm";
import { addDebugOption } from "#workflows/cli/operations/addDebugOption";
import { registerSubcommands } from "#workflows/cli/operations/registerSubcommands";
import { runProgram } from "#workflows/cli/operations/runProgram";

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
