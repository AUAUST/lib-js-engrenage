import type { EdgeSort } from "#foundation/extensions/types/EdgeSort";

interface Node<Item> {
  readonly item: Item;
  readonly reads: readonly string[];
  readonly produces: readonly string[];
  readonly dependencies: Node<Item>[];
}

export function sortByEdges<Item>(
  items: readonly Item[],
  {
    reads,
    produces,
    matches,
  }: {
    reads(item: Item): readonly string[];
    produces(item: Item): readonly string[];
    matches(read: string, produced: string): boolean;
  },
): EdgeSort<Item> {
  const nodes = items.map((item): Node<Item> => {
    return {
      item,
      reads: reads(item),
      produces: produces(item),
      dependencies: [],
    };
  });

  for (const node of nodes) {
    for (const producer of nodes) {
      const depends = producer !== node &&
      node.reads.some((read) => {
        return producer.produces.some((produced) => matches(read, produced));
      });

      if (depends) {
        node.dependencies.push(producer);
      }
    }
  }

  const placed = new Set<Node<Item>>();
  const order: Item[] = [];

  while (placed.size < nodes.length) {
    const ready = nodes.find((node) => {
      return (
        !placed.has(node) &&
        node.dependencies.every((dependency) => placed.has(dependency))
      );
    });

    if (ready === undefined) {
      return { cycle: findCycle(nodes, placed) };
    }

    placed.add(ready);
    order.push(ready.item);
  }

  return { order };
}

function findCycle<Item>(
  nodes: readonly Node<Item>[],
  placed: ReadonlySet<Node<Item>>,
): readonly Item[] {
  const path: Node<Item>[] = [];

  let current = nodes.find((node) => !placed.has(node));

  while (current !== undefined && !path.includes(current)) {
    path.push(current);

    current = current.dependencies.find((dependency) => {
      return !placed.has(dependency);
    });
  }

  if (current === undefined) {
    throw new Error("Edge sort stalled on an item without pending edges");
  }

  const cycle = [...path.slice(path.indexOf(current)), current];

  return cycle.map(({ item }) => item);
}
