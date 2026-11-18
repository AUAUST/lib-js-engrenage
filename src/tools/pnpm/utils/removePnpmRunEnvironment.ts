import { delimiter, join, sep } from "node:path";

import { flatMap } from "@auaust/toolkit/iterable";
import { entries, record } from "@auaust/toolkit/object";

import { pnpmRunVariables } from "#tools/pnpm/constants";

/**
 * Removes from an environment what pnpm sets for the package it runs a binary
 * in: its `npm_` and `pnpm_` variables and its `node_modules/.bin` path entries,
 * so a process started in another package resolves that package's own.
 */
export function removePnpmRunEnvironment(
  environment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  const { prefixes, names, binaries } = pnpmRunVariables;

  const binariesSuffix = `${sep}${join(...binaries)}`;

  return record(
    flatMap(entries(environment), ([name, value]) => {
      if (
        prefixes.some((prefix) => name.startsWith(prefix)) ||
        names.some((removed) => removed === name)
      ) {
        return [];
      }

      if (name !== "PATH" || value === undefined) {
        return [[name, value]];
      }

      return [
        [
          name,
          value
            .split(delimiter)
            .filter((entry) => !entry.endsWith(binariesSuffix))
            .join(delimiter),
        ],
      ];
    }),
  );
}
