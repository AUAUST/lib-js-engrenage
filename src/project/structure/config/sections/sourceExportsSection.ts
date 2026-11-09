import { freeze, keys } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
import type { ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

export const sourceExportsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, File>> | undefined> {
    const { exports: configured } = await config.resolve("src.options");

    const { src } = await config.resolve("structure");

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
