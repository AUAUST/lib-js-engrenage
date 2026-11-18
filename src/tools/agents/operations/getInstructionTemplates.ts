import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

import {
  array,
  boolean,
  integer,
  looseObject,
  number,
  optional,
  pipe,
  string,
} from "valibot";

import { sort } from "@auaust/toolkit/array";

import { engrenage } from "#constants";
import { listDataFiles, resolveDataFile } from "#foundation/data/index";
import { validate } from "#foundation/options/index";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import { renderFragment } from "#tools/agents/utils/renderFragment";
import type { Extension } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";

type InstructionKind = "rules" | "sections" | "skills";

const templateSchema = looseObject({
  title: string(),
  description: string(),
  category: string(),
  default: optional(boolean(), false),
  order: pipe(number(), integer()),
  formerly: optional(array(string())),
});

// @debt init steps pass no active extensions, so they read only engrenage's own fragments
export async function getInstructionTemplates(
  kind: InstructionKind,
  {
    extensions = [],
    fillers,
  }: {
    extensions?: readonly Extension[] | undefined;
    fillers?: BlockFillers;
  } = {},
) {
  const engrenageRoot = new URL(
    ".",
    pathToFileURL(resolveDataFile(`${engrenage}/package.json`)),
  );

  const shipped = await Promise.all([
    listDataFiles(engrenageRoot, `./agents/${kind}/*.md`),
    ...extensions.map(({ name, root }) => {
      return root === undefined
        ? listDataFiles(
            engrenageRoot,
            `./extensions/${name}/agents/${kind}/*.md`,
          )
        : listDataFiles(root, `./agents/${kind}/*.md`);
    }),
  ]);

  const templates = await Promise.all(
    shipped.flat().map(async ({ file: source, specifier }) => {
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
        name: basename(source, ".md"),
        source,
        reference: specifier,
        body: fillers === undefined
          ? instruction.body
          : await renderFragment(instruction.body, source, fillers),
        paths: instruction.paths,
      };
    }),
  );

  const sources = new Map<string, string>();

  for (const { name, reference } of templates) {
    const first = sources.get(name);

    if (first !== undefined) {
      throw new Error(
        `Agent ${kind} "${name}" is shipped twice: ${first} and ${reference}`,
      );
    }

    sources.set(name, reference);
  }

  return sort(templates, (left, right) => {
    return left.order - right.order || left.name.localeCompare(right.name);
  });
}
