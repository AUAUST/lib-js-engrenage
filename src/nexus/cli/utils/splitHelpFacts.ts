import { freeze } from "@auaust/toolkit/object";

import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { HelpFacts } from "#nexus/cli/types/HelpFacts";
import type { HelpMount } from "#nexus/cli/types/HelpMount";

// @debt compares help facts by their JSON text, so key order and values JSON drops decide sameness
function isSame(first: unknown, second: unknown): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

function keepShared<Item>(
  lists: readonly (readonly Item[])[],
): readonly Item[] {
  const [first = [], ...others] = lists;

  return freeze(
    first.filter((item) => {
      return others.every((list) => {
        return list.some((other) => {
          return isSame(item, other);
        });
      });
    }),
  );
}

function keepOwn<Item>(
  list: readonly Item[],
  shared: readonly Item[],
): readonly Item[] {
  return freeze(
    list.filter((item) => {
      return !shared.some((other) => {
        return isSame(item, other);
      });
    }),
  );
}

function readShared(
  all: readonly HelpFacts[],
  pick: (facts: HelpFacts) => string | undefined,
): string | undefined {
  const [first, ...others] = all.map(pick);

  return others.every((other) => {
    return other === first;
  })
    ? first
    : undefined;
}

/**
 * Splits the facts of each of a listing's `paths`, in order, into those every
 * path shares and the mounts holding what only some paths state, paths stating
 * the same grouped into one mount.
 *
 * @pure
 */
export function splitHelpFacts(
  paths: readonly CommandPath[],
  all: readonly HelpFacts[],
): HelpFacts & { readonly mounts: readonly HelpMount[] } {
  const description = readShared(all, (facts) => facts.description);
  const after = readShared(all, (facts) => facts.after);

  const shared = {
    aliases: keepShared(all.map((facts) => facts.aliases)),
    arguments: keepShared(all.map((facts) => facts.arguments)),
    options: keepShared(all.map((facts) => facts.options)),
    subcommands: keepShared(all.map((facts) => facts.subcommands)),
  };

  const mounts: HelpMount[] = [];

  for (const [index, facts] of all.entries()) {
    const own: HelpFacts = {
      ...(description === undefined &&
        facts.description !== undefined && {
          description: facts.description,
        }),
      aliases: keepOwn(facts.aliases, shared.aliases),
      arguments: keepOwn(facts.arguments, shared.arguments),
      options: keepOwn(facts.options, shared.options),
      subcommands: keepOwn(facts.subcommands, shared.subcommands),
      ...(after === undefined &&
        facts.after !== undefined && { after: facts.after }),
    };

    const isEmpty = (
      own.description === undefined &&
      own.after === undefined &&
      own.aliases.length +
        own.arguments.length +
        own.options.length +
        own.subcommands.length ===
        0
    );

    const path = paths[index];

    if (isEmpty || path === undefined) {
      continue;
    }

    const mount = mounts.find((candidate) => {
      const { paths: _paths, ...rest } = candidate;

      return isSame(rest, own);
    });

    if (mount === undefined) {
      mounts.push({ ...own, paths: [path] });
    } else {
      mounts[mounts.indexOf(mount)] = {
        ...mount,
        paths: [...mount.paths, path],
      };
    }
  }

  return freeze({
    ...(description !== undefined && { description }),
    ...shared,
    ...(after !== undefined && { after }),
    mounts: freeze(
      mounts.map((mount) => {
        return freeze(mount);
      }),
    ),
  });
}
