import { is, keys } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/utils/validate";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { InputResolver } from "#foundation/options/types/InputResolver";
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
  { source }: { source?: string } = {},
): InputResolver<Context> {
  const memos = new Map<Section, Promise<Reading>>();
  const waits = new Map<Section, Set<Section>>();

  const inputs = new Map<
    string,
    Map<Declaration<unknown, unknown, unknown>, unknown>
  >();

  function readInput(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
  ): unknown {
    const validated = inputs.get(name) ?? new Map();

    if (validated.has(declaration)) {
      return validated.get(declaration);
    }

    const value = validate(
      declaration.schema,
      input[name],
      source === undefined ? `${name} config` : `${name} config in ${source}`,
    );

    validated.set(declaration, value);
    inputs.set(name, validated);

    return value;
  }

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
        declaration === undefined ? undefined : readInput(name, declaration),
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

  function validateSections(sections: readonly Section[]): void {
    const failures: string[] = [];

    for (const { name, declaration } of sections) {
      if (declaration === undefined) {
        throw new Error(`Config section ${name} has no declaration`);
      }

      try {
        readInput(name, declaration);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        failures.push(error.message);
      }
    }

    const known = new Set(sections.map(({ name }) => name));
    const unknown = keys(input).filter((key) => !known.has(key));

    if (unknown.length > 0) {
      failures.push(
        `Invalid ${source ?? "config"}:\n${unknown.map((key) => `Unknown key "${key}"`).join("\n")}`,
      );
    }

    if (failures.length > 0) {
      throw new Error(failures.join("\n\n"));
    }
  }

  return {
    context,
    async resolve<Output>(section: Section<Output>): Promise<Output> {
      const { value } = await read(section, undefined);

      return value as Output;
    },
    validate: validateSections,
  };
}
