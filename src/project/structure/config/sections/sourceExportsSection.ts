import { freeze, keys } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { sourceOptionsSection } from "#project/environments/index";
import { structureSection } from "#project/structure/config/sections/structureSection";
import { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
import type { File } from "#types/File";

export const sourceExportsSection = declareSection({
  name: "src.exports",
  async resolve(
    _input,
    config,
  ): Promise<Readonly<Record<string, File>> | undefined> {
    const { exports: configured } = await config.resolve(sourceOptionsSection);

    const { src } = await config.resolve(structureSection);

    const derived = resolveDomainEntries(src);

    for (const subpath of keys(configured ?? {})) {
      if (subpath in derived) {
        throw new Error(
          `Subpath '${subpath}' is exposed by src.exports and by the domain ${derived[subpath]}: remove it from src.exports`,
        );
      }
    }

    const exposed = { ...configured, ...derived };

    return keys(exposed).length === 0 ? undefined : freeze(exposed);
  },
});
