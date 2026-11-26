import type { TsdownPlugin } from "tsdown";

import { createBuildSources } from "#project/build/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createBuildSourcesPlugins(
  name: string,
  options: { root: Directory; inputs: readonly File[] },
): TsdownPlugin[] {
  const record = createBuildSources(options);

  return [
    {
      name,
      async buildStart() {
        await record.removePrevious();
      },
      buildEnd(error) {
        if (error === undefined) {
          record.add(this.getModuleIds());
        } else {
          record.fail();
        }
      },
      async closeBundle() {
        await record.write();
      },
    },
  ];
}
