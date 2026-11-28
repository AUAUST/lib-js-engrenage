#!/usr/bin/env node

import { launch } from "#nexus/cli/launch/index";

// @debt runs through engrenage's program loader, reading engrenage's config, until a split CLI finds its host (BL-efac74)
await launch(async () => {
  const { loadEngrenageProgram } = await import("#workflows/cli/index");

  return loadEngrenageProgram("batiment", import.meta.url, async () => {
    const { default: root } = await import("#bin/batiment/index");

    return { root };
  });
});
