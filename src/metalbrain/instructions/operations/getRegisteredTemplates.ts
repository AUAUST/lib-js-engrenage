import { readFile } from "node:fs/promises";

import { strictObject, string } from "valibot";

import { validate } from "#foundation/options/index";
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
 * `conditional` marks an entry a host contributed or a condition gates.
 *
 * @throws {Error} A body's frontmatter holds more than its title and description.
 */
export async function getRegisteredTemplates<Kind extends InstructionKind>(
  kind: Kind,
  {
    instructions,
    renderer,
  }: {
    instructions: InstructionRegistry;
    renderer?: FragmentRenderer | undefined;
  },
) {
  const registered = instructions.filter(isKind(kind)).filter(({ active }) => {
    return active;
  });

  return Promise.all(
    registered.map(async ({ entry, source, reference, contributed }) => {
      const instruction = parseInstruction(
        await readFile(source, "utf-8"),
        source,
      );

      const { title, description } = validate(
        frontmatterSchema,
        instruction.metadata,
        `${source} frontmatter`,
      );

      return {
        ...entry,
        default: entry.default ?? false,
        title,
        description,
        source,
        reference,
        conditional: contributed || entry.when !== undefined,
        body: renderer === undefined
          ? instruction.body
          : await renderer.render(instruction.body, source),
      };
    }),
  );
}
