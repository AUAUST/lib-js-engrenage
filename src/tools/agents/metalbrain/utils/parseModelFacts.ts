import { isFinite } from "@auaust/toolkit/number";

import { isRecord } from "#tools/agents/metalbrain/utils/isRecord";
import { isText } from "#tools/agents/metalbrain/utils/isText";
import type { ModelFact } from "#tools/agents/metalbrain/types/ModelFact";
import type { ModelFacts } from "#tools/agents/metalbrain/types/ModelFacts";
import type { Prices } from "#tools/agents/metalbrain/types/Prices";
import type { PriceTier } from "#tools/agents/metalbrain/types/PriceTier";
import type { TierCondition } from "#tools/agents/metalbrain/types/TierCondition";

function fail(path: string, expected: string): never {
  throw new Error(`Model facts: ${path} must be ${expected}`);
}

function readRecord(value: unknown, path: string): Record<string, unknown> {
  return isRecord(value) ? value : fail(path, "an object");
}

function readText(value: unknown, path: string): string {
  return isText(value) ? value : fail(path, "a string");
}

function readCount(value: unknown, path: string): number {
  return isFinite(value) && value >= 0
    ? value
    : fail(path, "a non-negative number");
}

function readPrices(value: unknown, path: string): Prices {
  const prices = readRecord(value, path);

  function read(kind: keyof Prices) {
    return readCount(prices[kind], `${path}.${kind}`);
  }

  return {
    input: read("input"),
    cacheWrite5m: read("cacheWrite5m"),
    cacheWrite1h: read("cacheWrite1h"),
    cacheRead: read("cacheRead"),
    output: read("output"),
  };
}

function readCondition(value: unknown, path: string): TierCondition {
  const { speed, contextAbove } = readRecord(value, path);

  return {
    ...(speed === undefined ? {} : { speed: readText(speed, `${path}.speed`) }),
    ...(contextAbove === undefined
      ? {}
      : { contextAbove: readCount(contextAbove, `${path}.contextAbove`) }),
  };
}

function readTier(value: unknown, path: string): PriceTier {
  const tier = readRecord(value, path);

  return {
    name: readText(tier.name, `${path}.name`),
    condition: readCondition(tier.condition, `${path}.condition`),
    prices: readPrices(tier.prices, `${path}.prices`),
  };
}

function readModel(value: unknown, path: string): ModelFact {
  const model = readRecord(value, path);

  const { tiers } = model;

  if (!Array.isArray(tiers) || tiers.length === 0) {
    return fail(`${path}.tiers`, "a non-empty array");
  }

  const { aliases = [] } = model;

  if (!Array.isArray(aliases)) {
    return fail(`${path}.aliases`, "an array");
  }

  return {
    family: readText(model.family, `${path}.family`),
    aliases: aliases.map((alias: unknown, index) => {
      return readText(alias, `${path}.aliases[${index}]`);
    }),
    contextWindow: readCount(model.contextWindow, `${path}.contextWindow`),
    maxOutput: readCount(model.maxOutput, `${path}.maxOutput`),
    tiers: tiers.map((tier: unknown, index) => {
      return readTier(tier, `${path}.tiers[${index}]`);
    }),
  };
}

// @debt validates by hand what a valibot schema would state, kept out so the hook loads only Node builtins
export function parseModelFacts(value: unknown): ModelFacts {
  const facts = readRecord(value, "the file");

  const source = readRecord(facts.source, "source");

  const models = readRecord(facts.models, "models");

  return {
    read: readText(facts.read, "read"),
    source: Object.fromEntries(
      Object.entries(source).map(([name, url]) => {
        return [name, readText(url, `source.${name}`)];
      }),
    ),
    models: Object.fromEntries(
      Object.entries(models).map(([id, model]) => {
        return [id, readModel(model, `models.${id}`)];
      }),
    ),
  };
}
