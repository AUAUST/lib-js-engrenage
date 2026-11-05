import { keys } from "@auaust/toolkit/object";

import { createEmittedManifest } from "#project/build/index";
import type { Plugin } from "#tools/vite/types/Plugin";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createEmittedManifestPlugin(
  name: string,
  options: { manifest: File; outDir: Directory },
): Plugin {
  const manifest = createEmittedManifest(options);

  return {
    name,
    async buildStart() {
      await manifest.removePrevious();
    },
    writeBundle(_options, bundle) {
      manifest.add(keys(bundle));
    },
    buildEnd(error) {
      if (error !== undefined) {
        manifest.fail();
      }
    },
    async closeBundle() {
      await manifest.write();
    },
  };
}
