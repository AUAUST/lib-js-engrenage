#!/usr/bin/env node

import { Command } from "@commander-js/extra-typings";

import eslint from "#bin/engrenage/eslint";
import prettier from "#bin/engrenage/prettier";
import sync from "#bin/engrenage/sync";
import tsc from "#bin/engrenage/tsc";
import tsdown from "#bin/engrenage/tsdown";
import vite from "#bin/engrenage/vite";
import vitest from "#bin/engrenage/vitest";
import packageJson from "#package.json" with { type: "json" };
import { registerSubcommands } from "#support/commander/utils/registerSubcommands";

const program = registerSubcommands(
  new Command("engrenage")
    .description(packageJson.description)
    .version(packageJson.version)
    .enablePositionalOptions(),
  {
    sync,
    ...tsc,
    ...vitest,
    ...tsdown,
    ...vite,
    ...eslint,
    ...prettier,
  },
);

await program.parseAsync();
