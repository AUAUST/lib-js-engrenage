#!/usr/bin/env node

// @debt The `auaust/no-dynamic-import` rule forbids the dynamic imports that load each subcommand only when it runs, so the rule is disabled here until it allows lazy command loading (#221).
/* eslint-disable auaust/no-dynamic-import */

import { launch } from "#bin/engrenage/launch";

await launch(() => {
  return import("#bin/engrenage/program");
});
