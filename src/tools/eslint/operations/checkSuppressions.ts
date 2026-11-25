import { looseObject, number, record, string } from "valibot";

import { entries } from "@auaust/toolkit/object";

import { readTextFile, relativeWithin } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { readCommittedFile, readRenamedFiles } from "#tools/git/index";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

const suppressionsSchema = record(
  string(),
  record(string(), looseObject({ count: number() })),
);

function readSuppressions(content: string | undefined, file: File) {
  return content === undefined
    ? {}
    : validate(suppressionsSchema, parseJson(content, file), file);
}

/**
 * Fails when the changed suppressions file suppresses more violations of a rule
 * in a file than the `HEAD` commit does, under the path `HEAD` holds the file at.
 */
export async function checkSuppressions(
  config: LoadedConfig,
  files: Files,
): Promise<GateResult> {
  const { root } = config.context;

  const resources = await config.resolve("resources");

  const path = resources.path("eslint-suppressions.json");

  const file = relativeWithin(root, path);

  if (!files.includes(file)) {
    return { ok: true, output: "" };
  }

  const current = readSuppressions(await readTextFile(path), file);

  const committed = readSuppressions(await readCommittedFile(root, file), file);

  const renamed = await readRenamedFiles(root);

  const added: string[] = [];

  for (const [source, rules] of entries(current)) {
    for (const [rule, { count }] of entries(rules)) {
      const previous = (
        committed[renamed.get(source) ?? source]?.[rule]?.count ?? 0
      );

      if (count > previous) {
        added.push(`${source} ${rule}: ${previous} → ${count}`);
      }
    }
  }

  return {
    ok: added.length === 0,
    output: `Fix these violations instead of suppressing them in ${file}:\n${added.join("\n")}`,
  };
}
