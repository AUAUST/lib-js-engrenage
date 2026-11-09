import { array, is, object, string } from "valibot";

import type { Directories } from "#types/Directories";

const explicitDirs = object({ dirs: array(string()) });

export function readInputDirs(input: unknown): Directories | undefined {
  return is(explicitDirs, input) ? input.dirs : undefined;
}
