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
    supporting = false,
  }: {
    extensions?: readonly Extension[] | undefined;
    fillers?: BlockFillers;
    supporting?: boolean;
  } = {},
) {
  const engrenageRoot = new URL(
    ".",
    pathToFileURL(resolveDataFile(`${engrenage}/package.json`)),
  );

  const origins: readonly {
    root: URL;
    subpath: `./${string}*${string}`;
  }[] = [
    { root: engrenageRoot, subpath: `./agents/${kind}/*.md` },
    ...extensions.map(({ name, root }) => {
      return root === undefined
        ? {
            root: engrenageRoot,
            subpath: `./extensions/${name}/agents/${kind}/*.md` as const,
          }
        : { root, subpath: `./agents/${kind}/*.md` as const };
    }),
  ];

  async function render(content: string, source: string) {
    return fillers === undefined
      ? content
      : await renderFragment(content, source, fillers);
  }

  const shipped = await Promise.all(
    origins.map(async (origin) => {
      const files = await listDataFiles(origin.root, origin.subpath);

      return files.map((file) => {
        return { ...file, origin };
      });
    }),
  );

  const templates = await Promise.all(
    shipped.flat().map(async ({ file: source, specifier, origin }) => {
      const instruction = parseInstruction(
        await readFile(source, "utf-8"),
        source,
      );

      const metadata = validate(
        templateSchema,
        instruction.metadata,
        `${source} template metadata`,
      );

      const name = basename(source, ".md");

      const supportingFiles = supporting
        ? await listDataFiles(origin.root, origin.subpath, { within: name })
        : [];

      return {
        ...metadata,
        name,
        source,
        reference: specifier,
        body: await render(instruction.body, source),
        paths: instruction.paths,
        supporting: await Promise.all(
          supportingFiles.map(async ({ file, specifier: reference }) => {
            return {
              name: basename(file),
              source: file,
              reference,
              body: await render(await readFile(file, "utf-8"), file),
            };
          }),
        ),
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
