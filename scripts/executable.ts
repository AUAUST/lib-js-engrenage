#!/usr/bin/env node

import { program } from "#nexus/cli/index";
import { runEngrenageProgram } from "#tools/nexus/index";

import support from "#scripts/index";

await runEngrenageProgram(program({ root: support }));
