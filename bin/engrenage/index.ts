#!/usr/bin/env node

import { launch } from "#bin/engrenage/launch";

await launch(() => {
  return import("#bin/engrenage/program");
});
