import { spawnSync } from "node:child_process";

import { array, pipe, regex, string, union } from "valibot";

import { find, last, map, toSorted, wrap } from "@auaust/primitive-kit/arrays";

import { validate } from "#utils/validate";
import type { Directory } from "#types/Directory";

const releaseSchema = pipe(string(), regex(/^\d+\.\d+\.\d+$/));

function compareVersions(a: string, b: string): number {
  const second = map(b.split("."), Number);

  const difference = map(a.split("."), (part, index) => {
    return Number(part) - (second[index] ?? 0);
  });

  return find(difference, (part) => part !== 0) ?? 0;
}

// @debt spawns pnpm and checks its status by hand, as installDependencies and invokeCommand of engrenage init do, instead of one shared subprocess helper
export function resolveLatestPnpm(root: Directory, major: number): string {
  const { stdout, status, error } = spawnSync(
    "pnpm",
    ["view", `pnpm@${major}`, "version", "--json"],
    { cwd: root, encoding: "utf-8" },
  );

  if (error !== undefined || status !== 0) {
    throw new Error(`Cannot look up the latest pnpm ${major}`, {
      cause: error,
    });
  }

  const versions = validate(
    union([releaseSchema, array(releaseSchema)]),
    JSON.parse(stdout),
    `pnpm view pnpm@${major}`,
  );

  const latest = last(toSorted(wrap(versions), compareVersions));

  if (latest === undefined) {
    throw new Error(`No pnpm ${major} release found`);
  }

  return latest;
}
