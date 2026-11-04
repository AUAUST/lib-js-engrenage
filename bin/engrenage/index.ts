#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import { agents } from "#bin/engrenage/agents/index";
import { debt } from "#bin/engrenage/debt";
import { eslint } from "#bin/engrenage/eslint";
import { init } from "#bin/engrenage/init";
import { pnpm } from "#bin/engrenage/pnpm/index";
import { prettier } from "#bin/engrenage/prettier";
import { structure } from "#bin/engrenage/structure";
import { sync } from "#bin/engrenage/sync";
import { tsc } from "#bin/engrenage/tsc";
import { tsdown } from "#bin/engrenage/tsdown";
import { vite } from "#bin/engrenage/vite";
import { vitest } from "#bin/engrenage/vitest";
import { addDebugOption } from "#cli/utils/addDebugOption";
import { registerSubcommands } from "#cli/utils/registerSubcommands";
import { runProgram } from "#cli/utils/runProgram";

import packageJson from "#package.json" with { type: "json" };

const program = registerSubcommands(
  new Command("engrenage")
    .description(packageJson.description)
    .version(packageJson.version)
    .enablePositionalOptions(),
  {
    init,
    sync,
    structure,
    debt,
    agents,
    pnpm,
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
