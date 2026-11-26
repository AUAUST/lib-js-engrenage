#!/usr/bin/env node

import { enableCompileCache } from "node:module";

enableCompileCache();

const [
  { createProgram },
  { runEngrenageProgram },
  { enableLinkedSource, findSourceExecutable, launch, restoreLinkedExecutable },
] = await Promise.all([
  import("#nexus/cli/index"),
  import("#tools/nexus/index"),
  import("#workflows/cli/index"),
]);

await launch(async () => {
  const checkout = await restoreLinkedExecutable(import.meta.url);

  if (checkout !== undefined) {
    return void (await import(checkout));
  }

  await enableLinkedSource(import.meta.url);

  const source = await findSourceExecutable(
    import.meta,
    "#bin/engrenage/executable",
  );

  if (source !== undefined) {
    return void (await import(source));
  }

  const { default: engrenage } = await import("#bin/engrenage/index");

  await runEngrenageProgram(createProgram("engrenage", engrenage));
});
