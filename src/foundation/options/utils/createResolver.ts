import { is, keys } from "@auaust/toolkit/object";

import { applyInputDefaults } from "#foundation/options/utils/applyInputDefaults";
import { validate } from "#foundation/options/utils/validate";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { InputResolver } from "#foundation/options/types/InputResolver";
import type { KeyedSection } from "#foundation/options/types/KeyedSection";
import type { Resolver } from "#foundation/options/types/Resolver";
import type { SectionSource } from "#foundation/options/types/SectionSource";

interface Reading {
  readonly value: unknown;
  readonly live: ReadonlyMap<string, unknown>;
}

interface Chain<Context> {
  readonly key: string;
  readonly trail: readonly string[];
  readonly live: Map<string, unknown>;
  readonly reader: Resolver<Context>;
  settled: boolean;
}

export function createResolver<
  Context,
  Sections extends object = Readonly<Record<string, unknown>>,
>(
  input: Readonly<Record<string, unknown>>,
  context: Context,
  {
    source,
    sections,
    defaults,
    unknownNote,
  }: {
    source?: string;
    sections: SectionSource<Context>;
    defaults?(
      name: string,
      reader: Resolver<Context>,
    ): Promise<Readonly<Record<string, unknown>>>;
    unknownNote?: string;
  },
): InputResolver<Context, Sections> {
  const loaded = new Map<string, Promise<KeyedSection>>();
  const memos = new Map<string, Promise<Reading>>();
  const waits = new Map<string, Set<string>>();

  const inputs = new Map<
    string,
    Map<Declaration<unknown, unknown, unknown>, Promise<unknown>>
  >();

  async function validateInput(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<unknown> {
    const value = defaults === undefined
      ? input[name]
      : applyInputDefaults(input[name], name, await defaults(name, reader));

    return validate(
      declaration.schema,
      value,
      source === undefined ? `${name} config` : `${name} config in ${source}`,
    );
  }

  function readInput(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<unknown> {
    const validated = inputs.get(name) ?? new Map();

    const cached = validated.get(declaration);

    if (cached !== undefined) {
      return cached;
    }

    const pending = validateInput(name, declaration, reader);

    validated.set(declaration, pending);
    inputs.set(name, validated);

    pending.catch(() => {
      if (validated.get(declaration) === pending) {
        validated.delete(declaration);
      }
    });

    return pending;
  }

  async function loadSection(
    key: string,
    reader: string | undefined,
  ): Promise<KeyedSection> {
    const keyed = await sections.load(key);

    if (keyed === undefined) {
      throw new Error(
        reader === undefined
          ? `Unknown config key "${key}"`
          : `Unknown config key "${key}", read by "${reader}"`,
      );
    }

    if (keyed.input !== undefined && keyed.section.declaration === undefined) {
      throw new Error(
        `Config key "${key}" names input "${keyed.input}", but its section declares none`,
      );
    }

    if (keyed.input === undefined && keyed.section.declaration !== undefined) {
      throw new Error(
        `Config key "${key}" has a declared section but names no input`,
      );
    }

    return keyed;
  }

  function load(key: string, reader?: string): Promise<KeyedSection> {
    const cached = loaded.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const pending = loadSection(key, reader);

    loaded.set(key, pending);

    pending.catch(() => {
      if (loaded.get(key) === pending) {
        loaded.delete(key);
      }
    });

    return pending;
  }

  async function readKeyInput(
    key: string,
    reader: Resolver<Context>,
  ): Promise<unknown> {
    const { input: name, section } = await load(key);

    return name === undefined || section.declaration === undefined
      ? undefined
      : readInput(name, section.declaration, reader);
  }

  function findPath(from: string, to: string): string[] | undefined {
    const visited = new Set<string>();

    function walk(key: string, path: string[]): string[] | undefined {
      if (key === to) {
        return path;
      }

      if (visited.has(key)) {
        return;
      }

      visited.add(key);

      for (const next of waits.get(key) ?? []) {
        const found = walk(next, [...path, next]);

        if (found !== undefined) {
          return found;
        }
      }
    }

    return walk(from, [from]);
  }

  function track(key: string, dependent: Chain<Context>) {
    const cycle = findPath(key, dependent.key);

    if (cycle !== undefined) {
      const trail = [...dependent.trail, dependent.key];
      const entry = trail.indexOf(key);
      const leading = entry === -1 ? [] : trail.slice(0, entry);

      throw new Error(
        `Config keys depend on each other: ${[...leading, ...cycle, key].join(" -> ")}`,
      );
    }

    const dependencies = waits.get(dependent.key) ?? new Set();

    dependencies.add(key);
    waits.set(dependent.key, dependencies);
  }

  async function compute(
    key: string,
    trail: readonly string[],
  ): Promise<Reading> {
    const { input: name, section } = await load(key);

    async function resolve(dependency: string): Promise<unknown> {
      const { value } = await read(dependency, chain);

      return value;
    }

    // @debt sections and refusals receive the open `Resolver<Context>`, not `Resolver<Context, Sections>`: a generic `Sections` is not assignable to `Section.resolve`'s open resolver, so key reads inside sections are untyped
    function input(dependency: string): Promise<unknown> {
      return readKeyInput(dependency, config);
    }

    const config: Resolver<Context> = {
      context,
      resolve,
      input,
    };

    const chain: Chain<Context> = {
      key,
      trail,
      live: new Map(),
      reader: config,
      settled: false,
    };

    try {
      const { declaration } = section;

      const value = await section.resolve(
        name === undefined || declaration === undefined
          ? undefined
          : await readInput(name, declaration, config),
        config,
      );

      return { value, live: chain.live };
    } finally {
      chain.settled = true;
    }
  }

  function memoize(key: string, trail: readonly string[]): Promise<Reading> {
    const pending = compute(key, trail);

    memos.set(key, pending);

    pending.catch(() => {
      if (memos.get(key) === pending) {
        memos.delete(key);
      }
    });

    return pending;
  }

  async function isStale({ live }: Reading): Promise<boolean> {
    for (const [key, value] of live) {
      const fresh = await settle(key, []);

      if (!is(fresh.value, value)) {
        return true;
      }
    }

    return false;
  }

  async function settle(
    key: string,
    trail: readonly string[],
  ): Promise<Reading> {
    const { section } = await load(key);

    if (section.live) {
      return compute(key, trail);
    }

    const pending = memos.get(key) ?? memoize(key, trail);

    const reading = await pending;

    if (!(await isStale(reading))) {
      return reading;
    }

    const current = memos.get(key);

    return current !== undefined && current !== pending
      ? current
      : memoize(key, trail);
  }

  async function read(
    key: string,
    chain: Chain<Context> | undefined,
  ): Promise<Reading> {
    const active = chain === undefined || chain.settled ? undefined : chain;

    const refusal = await sections.refuse?.(key, active?.reader ?? reader);

    if (refusal !== undefined) {
      throw new Error(
        active === undefined ? refusal : `${refusal}, read by "${active.key}"`,
      );
    }

    if (active !== undefined) {
      track(key, active);
    }

    const { section } = await load(key, active?.key);

    const reading = await settle(
      key,
      active === undefined ? [] : [...active.trail, active.key],
    );

    if (active !== undefined) {
      if (section.live) {
        active.live.set(key, reading.value);
      } else {
        for (const [live, value] of reading.live) {
          active.live.set(live, value);
        }
      }
    }

    return reading;
  }

  async function validateKeys(names: readonly string[]): Promise<void> {
    const failures: string[] = [];
    const known = new Set<string>();

    for (const key of names) {
      const { input: name, section } = await load(key);

      if (name === undefined || section.declaration === undefined) {
        continue;
      }

      known.add(name);

      try {
        await readInput(name, section.declaration, reader);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        failures.push(error.message);
      }
    }

    const unknown = keys(input).filter((key) => !known.has(key));

    if (unknown.length > 0) {
      const lines = unknown.map((key) => `Unknown key "${key}"`);

      if (unknownNote !== undefined) {
        lines.push(unknownNote);
      }

      failures.push(`Invalid ${source ?? "config"}:\n${lines.join("\n")}`);
    }

    if (failures.length > 0) {
      throw new Error(failures.join("\n\n"));
    }
  }

  async function readValue(key: string): Promise<unknown> {
    const { value } = await read(key, undefined);

    return value;
  }

  function readValueInput(key: string): Promise<unknown> {
    return readKeyInput(key, reader);
  }

  const reader: Resolver<Context> = {
    context,
    resolve: readValue,
    input: readValueInput,
  };

  function resolve<Key extends keyof Sections & string>(
    key: Key,
  ): Promise<Sections[Key]>;
  async function resolve(key: string): Promise<unknown> {
    return readValue(key);
  }

  return {
    context,
    resolve,
    input: readValueInput,
    validate: validateKeys,
  };
}
