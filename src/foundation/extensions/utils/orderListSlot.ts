import { sortByEdges } from "#foundation/extensions/utils/sortByEdges";
import type { EdgeDeclaration } from "#foundation/extensions/types/EdgeDeclaration";
import type { EntryShape } from "#foundation/extensions/types/EntryShape";

type Matches = (read: string, produced: string) => boolean;

interface Registered {
  readonly contribution: { readonly entry: EntryShape };
  readonly label: string;
}

interface Stage<Item extends Registered> {
  readonly stage: string;
  readonly members: readonly Item[];
}

export function orderListSlot<Item extends Registered>({
  slot,
  stages,
  edges,
  items,
  matches,
}: {
  slot: string;
  stages: readonly string[] | undefined;
  edges: boolean | EdgeDeclaration;
  items: readonly Item[];
  matches(read: string, produced: string): boolean;
}): { readonly order: readonly Item[]; readonly findings: readonly string[] } {
  const findings: string[] = [];

  if (stages === undefined) {
    const order =
      edges === false ? items : sortGroup(slot, items, matches, findings);

    return { order, findings };
  }

  const staged = stages.map((stage): Stage<Item> => {
    const members = items.filter(({ contribution }) => {
      return contribution.entry.stage === stage;
    });

    return { stage, members };
  });

  if (edges === false) {
    return { order: staged.flatMap(({ members }) => members), findings };
  }

  checkLaterStages(slot, staged, matches, findings);

  const order = staged.flatMap(({ members }) => {
    return sortGroup(slot, members, matches, findings);
  });

  return { order, findings };
}

function checkLaterStages<Item extends Registered>(
  slot: string,
  staged: readonly Stage<Item>[],
  matches: Matches,
  findings: string[],
): void {
  for (const [index, { members }] of staged.entries()) {
    for (const { stage, members: producers } of staged.slice(index + 1)) {
      for (const reader of members) {
        for (const read of reader.contribution.entry.reads ?? []) {
          for (const producer of producers) {
            const produced = producer.contribution.entry.produces ?? [];

            if (produced.some((production) => matches(read, production))) {
              findings.push(
                `${reader.label} in slot "${slot}" reads "${read}", produced in the later stage "${stage}" by ${producer.label}`,
              );
            }
          }
        }
      }
    }
  }
}

function sortGroup<Item extends Registered>(
  slot: string,
  group: readonly Item[],
  matches: Matches,
  findings: string[],
): readonly Item[] {
  const sorted = sortByEdges(group, {
    reads: ({ contribution }) => {
      return contribution.entry.reads ?? [];
    },
    produces: ({ contribution }) => {
      return contribution.entry.produces ?? [];
    },
    matches,
  });

  if ("order" in sorted) {
    return sorted.order;
  }

  const path = sorted.cycle.map(({ label }) => label);

  findings.push(
    `Contributions to "${slot}" depend on each other: ${path.join(" -> ")}`,
  );

  return [];
}
