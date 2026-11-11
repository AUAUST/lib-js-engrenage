import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

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
import { listDataFiles, resolveDataFile } from "#foundation/data/index";
import { validate } from "#foundation/options/index";
import { agentsTemplate } from "#tools/agents/constants";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import type { Extension } from "#project/config/index";
import type { File } from "#types/File";

type InstructionKind = "rules" | "sections" | "skills";

const templateSchema = looseObject({
  title: string(),
  description: string(),
  category: string(),
  default: optional(boolean(), false),
  order: pipe(number(), integer()),
});

// @debt engrenage lists its own fragments beside its AGENTS.md template rather than through `listDataFiles`, since it has no URL of its package root
async function listOwnTemplateFiles(
  kind: InstructionKind,
): Promise<readonly { readonly file: File; readonly specifier: string }[]> {
  const directory = resolve(
    dirname(resolveDataFile(agentsTemplate)),
    `../${kind}`,
  );

  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => {
      return entry.isFile() && entry.name.endsWith(".md");
    })
    .map(({ name }) => {
      return {
        file: resolve(directory, name),
        specifier: `${engrenage}/agents/${kind}/${name}`,
      };
    });
}

// @debt only `engrenage sync agents` passes the active extensions; init steps, agent checks and codex profile resolution read engrenage's own fragments
export async function getInstructionTemplates(
  kind: InstructionKind,
  extensions: readonly Extension[] = [],
) {
  const shipped = await Promise.all([
    listOwnTemplateFiles(kind),
    ...extensions.flatMap(({ root }) => {
      return root === undefined
        ? []
        : [listDataFiles(root, `./agents/${kind}/*.md`)];
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
        body: instruction.body,
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
