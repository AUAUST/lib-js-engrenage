import { array, pipe, regex, string, union } from "valibot";

import { last, toSorted, wrap } from "@auaust/primitive-kit/arrays";

import { validate } from "#foundation/options/index";
import { runProcess } from "#foundation/processes/index";
import { compareVersions } from "#project/package/index";
import type { Directory } from "#types/Directory";

const releaseSchema = pipe(string(), regex(/^\d+\.\d+\.\d+$/));

export async function resolveLatestPnpm(
  root: Directory,
  range: string,
): Promise<string> {
  const { stdout } = await runProcess(
    "pnpm",
    ["view", `pnpm@${range}`, "version", "--json"],
    { cwd: root },
  );

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
