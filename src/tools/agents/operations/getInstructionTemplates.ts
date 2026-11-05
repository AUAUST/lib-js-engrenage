import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  boolean,
  integer,
  looseObject,
  number,
  optional,
  pipe,
  string,
} from "valibot";

import { sort } from "@auaust/primitive-kit/arrays";

import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import { validate } from "#foundation/options/index";
import { agentsTemplate } from "#tools/agents/constants";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";

const templateSchema = looseObject({
  title: string(),
  description: string(),
  category: string(),
  default: optional(boolean(), false),
  order: pipe(number(), integer()),
});

export async function getInstructionTemplates(
  kind: "rules" | "sections" | "skills",
) {
  const directory = resolve(
    dirname(resolveDataFile(agentsTemplate)),
    `../${kind}`,
  );

  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const templates = await Promise.all(
    entries
      .filter((entry) => {
        return entry.isFile() && entry.name.endsWith(".md");
      })
      .map(async ({ name }) => {
        const source = resolve(directory, name);

        const instruction = parseInstruction(
          await readFile(source, "utf-8"),
          source,
        );

        const metadata = validate(
          templateSchema,
          instruction.metadata,
          `${source} template metadata`,
        );

        return {
          ...metadata,
          name: name.slice(0, -3),
          source,
          reference: `${engrenage}/agents/${kind}/${name}`,
          body: instruction.body,
          paths: instruction.paths,
        };
      }),
  );

  return sort(templates, (left, right) => {
    return left.order - right.order || left.name.localeCompare(right.name);
  });
}
