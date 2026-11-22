import { array, check, pipe, string } from "valibot";

import { object } from "@auaust/toolkit";

import { removedRuntimes } from "#tools/metalbrain/constants";

export const preferredSchema = array(
  pipe(
    string(),
    check(
      (name) => !object.hasOwn(removedRuntimes, name),
      (issue) => `${issue.input}: ${removedRuntimes[issue.input] ?? ""}`,
    ),
  ),
);
