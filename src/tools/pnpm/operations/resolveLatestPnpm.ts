import { array, pipe, regex, string, union } from "valibot";

import { last, toSorted, wrap } from "@auaust/primitive-kit/arrays";

import { validate } from "#foundation/options/index";
import { spawnProcess } from "#foundation/processes/index";
import { compareVersions } from "#project/package/index";
import type { Directory } from "#types/Directory";

const releaseSchema = pipe(string(), regex(/^\d+\.\d+\.\d+$/));

// @debt checks the spawn error and the status by hand, as installDependencies and invokeCommand of engrenage init do, instead of spawnProcess owning the check
export function resolveLatestPnpm(root: Directory, range: string): string {
  const { stdout, status, error } = spawnProcess(
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
