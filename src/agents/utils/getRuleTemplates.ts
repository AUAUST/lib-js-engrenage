import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import { sort } from "@auaust/primitive-kit/arrays";

import { agentsTemplate } from "#agents/constants";
import { engrenage } from "#constants";

export function getRuleTemplates() {
  const directory = resolve(
    dirname(createRequire(import.meta.url).resolve(agentsTemplate)),
    "../rules",
  );

  return sort(readdirSync(directory))
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      return {
        source: resolve(directory, name),
        file: `.claude/rules/${name}`,
        reference: `${engrenage}/agents/rules/${name}`,
      };
    });
}
