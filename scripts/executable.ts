#!/usr/bin/env node

import { createProgram } from "#nexus/cli/index";
import { runEngrenageProgram } from "#tools/nexus/index";

import support from "#scripts/index";

await runEngrenageProgram(createProgram("support", support));
