import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
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

import { agentsTemplate } from "#agents/constants";
import { parseInstruction } from "#agents/utils/parseInstruction";
import { engrenage } from "#constants";
import { validate } from "#utils/validate";

const templateSchema = looseObject({
  title: string(),
  description: string(),
  category: string(),
  default: optional(boolean(), false),
  order: pipe(number(), integer()),
});

export function getInstructionTemplates(kind: "rules" | "sections") {
  const directory = resolve(
    dirname(createRequire(import.meta.url).resolve(agentsTemplate)),
    `../${kind}`,
  );

  const templates = readdirSync(directory, {
    withFileTypes: true,
  })
    .filter((entry) => {
      return entry.isFile() && entry.name.endsWith(".md");
    })
    .map(({ name }) => {
      const source = resolve(directory, name);

      const instruction = parseInstruction(
        readFileSync(source, "utf-8"),
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
    });

  return sort(templates, (left, right) => {
    return left.order - right.order || left.name.localeCompare(right.name);
  });
}
