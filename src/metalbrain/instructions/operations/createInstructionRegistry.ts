import { basename } from "node:path";

import { entries } from "@auaust/toolkit/object";

import { listDataFiles } from "#foundation/data/index";
import {
  resolveMetalbrainRoot,
  type MetalbrainFacts,
} from "#metalbrain/facts/index";
import {
  builtInInstructions,
  instructionDirectories,
  metalbrain,
} from "#metalbrain/instructions/constants";
import type { InstructionEntry } from "#metalbrain/instructions/ports/InstructionEntry";
import type { ContributedInstruction } from "#metalbrain/instructions/types/ContributedInstruction";
import type { InstructionKind } from "#metalbrain/instructions/types/InstructionKind";
import type { InstructionRegistry } from "#metalbrain/instructions/types/InstructionRegistry";
import type { File } from "#types/File";

interface ShippedFile {
  readonly file: File;
  readonly specifier: string;
}

function locate(origin: URL, kind: InstructionKind, name: string): string {
  return `${origin.href} ${kind} ${name}`;
}

async function listShipped(origins: readonly URL[]) {
  const shipped = new Map<string, ShippedFile>();

  const unique = [...new Map(origins.map((url) => [url.href, url])).values()];

  for (const origin of unique) {
    for (const [kind, directory] of entries(instructionDirectories)) {
      const files = await listDataFiles(
        origin,
        `./${metalbrain}/${directory}/*.md`,
      );

      for (const found of files) {
        shipped.set(locate(origin, kind, basename(found.file, ".md")), found);
      }
    }
  }

  return shipped;
}

/**
 * The instruction registry: the built-in entries, then the contributed ones,
 * each resolved to its Markdown body in the package shipping it and evaluated
 * against the facts.
 *
 * @throws {Error} Two entries of a kind share a name, an entry's package ships
 * no body for it, or a package ships a body no entry registers.
 */
export async function createInstructionRegistry({
  facts,
  contributions,
}: {
  facts: MetalbrainFacts;
  contributions: readonly ContributedInstruction[];
}): Promise<InstructionRegistry> {
  const root = resolveMetalbrainRoot();

  const registered: readonly {
    readonly entry: InstructionEntry;
    readonly origin: URL;
    readonly contributed: boolean;
  }[] = [
    ...builtInInstructions.map((entry) => {
      return {
        entry,
        origin: root,
        contributed: false,
      };
    }),
    ...contributions.map(({ entry, origin }) => {
      return {
        entry,
        origin,
        contributed: true,
      };
    }),
  ];

  const shipped = await listShipped([
    ...facts.fragments.origins,
    ...registered.map(({ origin }) => origin),
  ]);

  const names = new Map<string, string>();

  const registry = registered.map(({ entry, origin, contributed }) => {
    const { kind, name } = entry;

    const first = names.get(`${kind} ${name}`);

    if (first !== undefined) {
      throw new Error(
        `Agent ${kind} "${name}" is registered twice: by ${first} and ${origin.href}`,
      );
    }

    names.set(`${kind} ${name}`, origin.href);

    const location = locate(origin, kind, name);

    const found = shipped.get(location);

    if (found === undefined) {
      throw new Error(
        `Agent ${kind} "${name}" has no ./${metalbrain}/${instructionDirectories[kind]}/${name}.md export in ${origin.href}`,
      );
    }

    shipped.delete(location);

    return {
      entry,
      source: found.file,
      reference: found.specifier,
      active: entry.when?.(facts) ?? true,
      contributed,
    };
  });

  const unregistered = [...shipped.values()].map(({ specifier }) => {
    return specifier;
  });

  if (unregistered.length > 0) {
    throw new Error(
      `No instruction entry registers ${unregistered.join(", ")}`,
    );
  }

  return registry;
}
