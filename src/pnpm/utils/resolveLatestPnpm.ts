import { spawnSync } from "node:child_process";

import { array, pipe, regex, string, union } from "valibot";

import { last, toSorted, wrap } from "@auaust/primitive-kit/arrays";

import { validate } from "#foundation/options/utils/validate";
import { compareVersions } from "#support/packageJson/utils/compareVersions";
import type { Directory } from "#types/Directory";

const releaseSchema = pipe(string(), regex(/^\d+\.\d+\.\d+$/));

// @debt spawns pnpm and checks its status by hand, as installDependencies and invokeCommand of engrenage init do, instead of one shared subprocess helper
export function resolveLatestPnpm(root: Directory, range: string): string {
  const { stdout, status, error } = spawnSync(
    "pnpm",
    ["view", `pnpm@${range}`, "version", "--json"],
    { cwd: root, encoding: "utf-8" },
  );

  if (error !== undefined || status !== 0) {
    throw new Error(`Cannot look up the latest pnpm ${range}`, {
      cause: error,
    });
  }

  const versions = validate(
    union([releaseSchema, array(releaseSchema)]),
    JSON.parse(stdout),
    `pnpm view pnpm@${range}`,
  );

  const latest = last(toSorted(wrap(versions), compareVersions));

  if (latest === undefined) {
    throw new Error(`No pnpm release within ${range} found`);
  }

  return latest;
}
