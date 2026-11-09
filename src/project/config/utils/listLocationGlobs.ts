import type { FileLocation } from "#project/config/types/FileLocation";
import type { Globs } from "#types/Globs";

export function listLocationGlobs(location: FileLocation): Globs {
  if ("globs" in location) {
    return location.globs;
  }

  return "file" in location ? [location.file] : [`${location.directory}/**`];
}
