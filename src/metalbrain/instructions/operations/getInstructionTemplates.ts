import { readFile } from "node:fs/promises";
import { basename } from "node:path";

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

import { listDataFiles } from "#foundation/data/index";
import { validate } from "#foundation/options/index";
import {
  createFragmentSources,
  type FragmentSources,
} from "#metalbrain/facts/index";
import { metalbrain } from "#metalbrain/instructions/constants";
import { parseInstruction } from "#metalbrain/instructions/operations/parseInstruction";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";

// @debt skills still read their metadata from frontmatter until they join the instruction registry
type InstructionKind = "skills";

const templateSchema = looseObject({
  title: string(),
  description: string(),
  category: string(),
  default: optional(boolean(), false),
  order: pipe(number(), integer()),
  extension: optional(string()),
  formerly: optional(array(string())),
});

// @debt init steps pass no fragment sources, so they read only engrenage's own fragments
export async function getInstructionTemplates(
  kind: InstructionKind,
  {
    fragments = createFragmentSources([]),
    renderer,
    supporting = false,
  }: {
    fragments?: FragmentSources | undefined;
    renderer?: FragmentRenderer;
    supporting?: boolean;
  } = {},
) {
  const { extensions: active, origins } = fragments;

  const subpath = `./${metalbrain}/${kind}/*.md` as const;

  async function render(content: string, source: string) {
    return renderer === undefined
      ? content
      : await renderer.render(content, source);
  }

  const shipped = await Promise.all(
    origins.map(async (origin) => {
      const files = await listDataFiles(origin, subpath);

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

      // @debt an `extension` naming no known extension hides the fragment silently instead of failing
      if (metadata.extension !== undefined && !active.has(metadata.extension)) {
        return [];
      }

      const name = basename(source, ".md");

      const supportingFiles = supporting
        ? await listDataFiles(origin, subpath, { within: name })
        : [];

      return [
        {
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
        },
      ];
    }),
  );

  const sources = new Map<string, string>();

  for (const { name, reference } of templates.flat()) {
    const first = sources.get(name);

    if (first !== undefined) {
      throw new Error(
        `Agent ${kind} "${name}" is shipped twice: ${first} and ${reference}`,
      );
    }

    sources.set(name, reference);
  }

  return sort(templates.flat(), (left, right) => {
    return left.order - right.order || left.name.localeCompare(right.name);
  });
}
