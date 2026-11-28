#!/usr/bin/env node

import { launch } from "#nexus/cli/launch/index";

await launch(async () => {
  const { loadEngrenageProgram } = await import("#workflows/cli/index");

  return loadEngrenageProgram("engrenage", import.meta.url, async () => {
    const { default: root } = await import("#bin/engrenage/index");

    return { root };
  });
});
