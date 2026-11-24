import { freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentPresetEntry } from "#project/environments/ports/EnvironmentPresetEntry";

export const environmentPresetsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<readonly EnvironmentPresetEntry[]> {
    const { scopeDir, registry } = config.context;

    const own = await registry.contributions("environmentPresets", config);

    async function readInherited(): Promise<readonly EnvironmentPresetEntry[]> {
      if (scopeDir === rootScope) {
        return [];
      }

      const root = await config.context.scope(rootScope);

      return root.resolve("environmentPresets");
    }

    const inherited = await readInherited();

    const byName = new Map<string, EnvironmentPresetEntry>();

    for (const preset of [...inherited, ...own.map(({ entry }) => entry)]) {
      const known = byName.get(preset.name);

      if (known !== undefined && known !== preset) {
        throw new Error(
          `The scope ${scopeDir} has two environment presets named "${preset.name}", one inherited from the root`,
        );
      }

      byName.set(preset.name, preset);
    }

    return freeze([...byName.values()]);
  },
});
