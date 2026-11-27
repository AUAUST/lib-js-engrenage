import { array, parse, record, strictObject, string } from "valibot";

import { freeze, getOwn, mapValues, values } from "@auaust/toolkit/object";

import { effectGlobalsSchema } from "#batiment/effects/index";
import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentGlobals } from "#project/environments/types/EnvironmentGlobals";

const hostSchema = strictObject({
  aliases: array(string()),
  globals: effectGlobalsSchema,
});

const shippedGlobalsSchema = strictObject({
  apis: record(string(), effectGlobalsSchema),
  hosts: strictObject({
    isomorphic: hostSchema,
    browser: hostSchema,
    node: hostSchema,
  }),
});

export const environmentGlobalsSection = declareSection({
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, EnvironmentGlobals>>> {
    const [execution, shipped] = await Promise.all([
      config.resolve("environments.execution"),
      readJsonFile(resolveDataFile(`${engrenage}/effects/globals.json`)),
    ]);

    const { apis, hosts } = parse(shippedGlobalsSchema, shipped);

    return freeze(
      mapValues(execution, ({ globals: host, apis: groups }) => {
        if (host === undefined) {
          return freeze({ aliases: [], ranks: [] });
        }

        const { aliases, globals } = hosts[host];

        const reached = host === "isomorphic"
          ? groups.map((group) => getOwn(apis, group))
          : values(apis);

        return freeze({
          aliases,
          ranks: [globals, ...reached].filter((ranks) => ranks !== undefined),
        });
      }),
    );
  },
});
