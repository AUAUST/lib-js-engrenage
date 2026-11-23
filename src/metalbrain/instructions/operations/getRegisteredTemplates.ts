import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import { optional, strictObject, string, unknown } from "valibot";

import { listDataFiles } from "#foundation/data/index";
import { validate } from "#foundation/options/index";
import {
  instructionDirectories,
  metalbrain,
} from "#metalbrain/instructions/constants";
import { parseInstruction } from "#metalbrain/instructions/operations/parseInstruction";
import type { InstructionEntry } from "#metalbrain/instructions/ports/InstructionEntry";
import type { FragmentRenderer } from "#metalbrain/instructions/types/FragmentRenderer";
import type { InstructionKind } from "#metalbrain/instructions/types/InstructionKind";
import type { InstructionRegistry } from "#metalbrain/instructions/types/InstructionRegistry";
import type { RegisteredInstruction } from "#metalbrain/instructions/types/RegisteredInstruction";

const frontmatterSchema = strictObject({
  title: string(),
  description: string(),
});

// @debt skill files keep the `agent` block their agent files derive from until agents join the instruction registry
const skillFrontmatterSchema = strictObject({
  ...frontmatterSchema.entries,
  agent: optional(unknown()),
});

function isKind<Kind extends InstructionKind>(kind: Kind) {
  return (
    registered: RegisteredInstruction,
  ): registered is RegisteredInstruction<
    Extract<InstructionEntry, { kind: Kind }>
  > => {
    return registered.entry.kind === kind;
  };
}

/**
 * The active registry entries of a kind, in registry order, each with its
 * file's title and description and its body, rendered when a renderer is given.
 * `conditional` marks an entry a host contributed or a condition gates. With
 * `supporting`, each also lists the files its package ships in the directory
 * named after it beside its body, rendered alike.
 *
 * @throws {Error} A body's frontmatter holds more than its title and description.
 */
export async function getRegisteredTemplates<Kind extends InstructionKind>(
  kind: Kind,
  {
    instructions,
    renderer,
    supporting = false,
  }: {
    instructions: InstructionRegistry;
    renderer?: FragmentRenderer | undefined;
    supporting?: boolean;
  },
) {
  const registered = instructions.filter(isKind(kind)).filter(({ active }) => {
    return active;
  });

  const subpath = `./${metalbrain}/${instructionDirectories[kind]}/*.md` as const;

  async function render(content: string, source: string) {
    return renderer === undefined
      ? content
      : await renderer.render(content, source);
  }

  return Promise.all(
    registered.map(
      async ({ entry, source, reference, origin, contributed }) => {
        const instruction = parseInstruction(
          await readFile(source, "utf-8"),
          source,
        );

        const { title, description, agent } = kind === "skill"
          ? validate(
              skillFrontmatterSchema,
              instruction.metadata,
              `${source} frontmatter`,
            )
          : {
              ...validate(
                frontmatterSchema,
                instruction.metadata,
                `${source} frontmatter`,
              ),
              agent: undefined,
            };

        const supportingFiles = supporting
          ? await listDataFiles(origin, subpath, { within: entry.name })
          : [];

        return {
          ...entry,
          default: entry.default ?? false,
          title,
          description,
          agent,
          source,
          reference,
          conditional: contributed || entry.when !== undefined,
          body: await render(instruction.body, source),
          supporting: await Promise.all(
            supportingFiles.map(async ({ file, specifier }) => {
              return {
                name: basename(file),
                source: file,
                reference: specifier,
                body: await render(await readFile(file, "utf-8"), file),
              };
            }),
          ),
        };
      },
    ),
  );
}
