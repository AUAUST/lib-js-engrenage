import type { TsdownPlugin } from "tsdown";

import { keys } from "@auaust/toolkit/object";

import { createEmittedManifest } from "#project/build/operations/createEmittedManifest";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createEmittedManifestPlugins(
  name: string,
  options: { manifest: File; outDir: Directory },
): TsdownPlugin[] {
  const manifest = createEmittedManifest(options);

  return [
    {
      name,
      buildStart() {
        manifest.removePrevious();
      },
      writeBundle(_options, bundle) {
        manifest.add(keys(bundle));
      },
      buildEnd(error) {
        if (error !== undefined) {
          manifest.fail();
        }
      },
      closeBundle() {
        manifest.write();
      },
    },
  ];
}
