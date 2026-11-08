#!/usr/bin/env node

import { createProgram, runProgram } from "#workflows/cli/index";

import support from "#scripts/index";

await runProgram(createProgram("support", support));
