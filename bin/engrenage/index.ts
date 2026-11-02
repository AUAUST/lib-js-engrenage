#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import { agents } from "#bin/engrenage/agents/index";
import { debt } from "#bin/engrenage/debt";
import { eslint } from "#bin/engrenage/eslint";
import { init } from "#bin/engrenage/init";
import { prettier } from "#bin/engrenage/prettier";
import { sync } from "#bin/engrenage/sync";
import { tsc } from "#bin/engrenage/tsc";
import { tsdown } from "#bin/engrenage/tsdown";
import { vite } from "#bin/engrenage/vite";
import { vitest } from "#bin/engrenage/vitest";
import { addDebugOption } from "#support/commander/utils/addDebugOption";
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";
import { runProgram } from "#support/commander/utils/runProgram";

import packageJson from "#package.json" with { type: "json" };

const program = registerSubcommands(
  new Command("engrenage")
    .description(packageJson.description)
    .version(packageJson.version)
    .enablePositionalOptions(),
  {
    init,
    sync,
    debt,
    agents,
    ...tsc,
    ...vitest,
    ...tsdown,
    ...vite,
    ...eslint,
    ...prettier,
  },
);

addDebugOption(program);

await runProgram(program);
