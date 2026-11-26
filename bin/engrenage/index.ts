import { defineGroup } from "#nexus/cli/index";

import eslint from "#bin/engrenage/eslint";
import eslintFix from "#bin/engrenage/eslintFix";
import eslintSuppress from "#bin/engrenage/eslintSuppress";
import gate from "#bin/engrenage/gate";
import init from "#bin/engrenage/init";
import jscpd from "#bin/engrenage/jscpd";
import jscpdNew from "#bin/engrenage/jscpdNew";
import link from "#bin/engrenage/link";
import pnpm from "#bin/engrenage/pnpm/index";
import prettier from "#bin/engrenage/prettier";
import prettierAll from "#bin/engrenage/prettierAll";
import prettierCheck from "#bin/engrenage/prettierCheck";
import sync from "#bin/engrenage/sync";
import tsc from "#bin/engrenage/tsc";
import tscDist from "#bin/engrenage/tscDist";
import tsdown from "#bin/engrenage/tsdown";
import vite from "#bin/engrenage/vite";
import vitest from "#bin/engrenage/vitest";
import vitestCoverage from "#bin/engrenage/vitestCoverage";
import vitestDist from "#bin/engrenage/vitestDist";
import vitestWatch from "#bin/engrenage/vitestWatch";
import packageJson from "#package.json" with { type: "json" };

export default defineGroup({
  configure(command) {
    return command
      .description(packageJson.description)
      .version(packageJson.version)
      .enablePositionalOptions();
  },
  commands: {
    "init": init,
    "sync": sync,
    "gate": gate,
    "pnpm": pnpm,
    "link": link,
    "tsc": {
      command: tsc,
      aliases: ["typecheck"],
    },
    "tsc:dist": {
      command: tscDist,
      aliases: ["typecheck:dist"],
    },
    "vitest": vitest,
    "vitest:watch": vitestWatch,
    "vitest:coverage": vitestCoverage,
    "vitest:dist": vitestDist,
    "tsdown": tsdown,
    "vite": vite,
    "eslint": {
      command: eslint,
      aliases: ["lint"],
    },
    "eslint:fix": {
      command: eslintFix,
      aliases: ["lint:fix"],
    },
    "eslint:suppress": {
      command: eslintSuppress,
      aliases: ["lint:suppress"],
    },
    "jscpd": jscpd,
    "jscpd:new": jscpdNew,
    "prettier": {
      command: prettier,
      aliases: ["format"],
    },
    "prettier:check": prettierCheck,
    "prettier:all": {
      command: prettierAll,
      aliases: ["format:all"],
    },
  },
});
