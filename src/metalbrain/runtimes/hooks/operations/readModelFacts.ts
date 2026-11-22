import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { modelFactsSpecifier } from "#metalbrain/runtimes/hooks/constants";
import { parseModelFacts } from "#metalbrain/runtimes/hooks/utils/parseModelFacts";
import type { ModelFacts } from "#metalbrain/runtimes/types/ModelFacts";

/**
 * Reads the model facts the package ships, failing when they do not
 * match their schema.
 */
export async function readModelFacts(): Promise<ModelFacts> {
  const file = createRequire(import.meta.url).resolve(modelFactsSpecifier);

  return parseModelFacts(JSON.parse(await readFile(file, "utf-8")));
}
