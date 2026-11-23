import { pathToFileURL } from "node:url";

import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";

/**
 * The root of the package shipping metalbrain's own instruction fragments.
 */
export function resolveMetalbrainRoot(): URL {
  return new URL(
    ".",
    pathToFileURL(resolveDataFile(`${engrenage}/package.json`)),
  );
}
