import { is } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/utils/validate";
import type { Resolver } from "#foundation/options/types/Resolver";
import type { Section } from "#foundation/options/types/Section";

interface Reading {
  readonly value: unknown;
  readonly live: ReadonlyMap<Section, unknown>;
}

interface Chain {
  readonly section: Section;
  readonly live: Map<Section, unknown>;
  settled: boolean;
}

export function createResolver<Context>(
  input: Readonly<Record<string, unknown>>,
  context: Context,
): Resolver<Context> {
  const memos = new Map<Section, Promise<Reading>>();
  const waits = new Map<Section, Set<Section>>();

  function findPath(from: Section, to: Section): Section[] | undefined {
    const visited = new Set<Section>();

    function walk(section: Section, path: Section[]): Section[] | undefined {
      if (section === to) {
        return path;
      }

      if (visited.has(section)) {
        return;
      }

      visited.add(section);

      for (const next of waits.get(section) ?? []) {
        const found = walk(next, [...path, next]);

        if (found !== undefined) {
          return found;
        }
      }
    }

    return walk(from, [from]);
  }

  function track(section: Section, dependent: Section) {
    const cycle = findPath(section, dependent);

    if (cycle !== undefined) {
      throw new Error(
        `Config sections depend on each other: ${[...cycle, section].map(({ name }) => name).join(" -> ")}`,
      );
    }

    const dependencies = waits.get(dependent) ?? new Set();

    dependencies.add(section);
    waits.set(dependent, dependencies);
  }

  async function compute(section: Section): Promise<Reading> {
    const chain: Chain = {
      section,
      live: new Map(),
      settled: false,
    };

    const config: Resolver = {
      context,
      async resolve<Output>(dependency: Section<Output>): Promise<Output> {
        const { value } = await read(dependency, chain);

        return value as Output;
      },
    };

    try {
      const { declaration, name } = section;

      const value = await section.resolve(
        declaration === undefined
          ? undefined
          : validate(declaration.schema, input[name], `${name} config`),
        config,
      );

      return { value, live: chain.live };
    } finally {
      chain.settled = true;
    }
  }

  function memoize(section: Section): Promise<Reading> {
    const pending = compute(section);

    memos.set(section, pending);

    pending.catch(() => {
      if (memos.get(section) === pending) {
        memos.delete(section);
      }
    });

    return pending;
  }

  async function isStale({ live }: Reading): Promise<boolean> {
    for (const [section, value] of live) {
      const fresh = await settle(section);

      if (!is(fresh.value, value)) {
        return true;
      }
    }

    return false;
  }

  async function settle(section: Section): Promise<Reading> {
    if (section.live) {
      return compute(section);
    }

    const pending = memos.get(section) ?? memoize(section);
    const reading = await pending;

    if (!(await isStale(reading))) {
      return reading;
    }

    const current = memos.get(section);

    return current !== undefined && current !== pending
      ? current
      : memoize(section);
  }

  async function read(
    section: Section,
    chain: Chain | undefined,
  ): Promise<Reading> {
    const active = chain === undefined || chain.settled ? undefined : chain;

    if (active !== undefined) {
      track(section, active.section);
    }

    const reading = await settle(section);

    if (active !== undefined) {
      if (section.live) {
        active.live.set(section, reading.value);
      } else {
        for (const [live, value] of reading.live) {
          active.live.set(live, value);
        }
      }
    }

    return reading;
  }

  return {
    context,
    async resolve<Output>(section: Section<Output>): Promise<Output> {
      const { value } = await read(section, undefined);

      return value as Output;
    },
  };
}
