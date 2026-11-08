import { defineGroup } from "#workflows/cli/index";

import agents from "#bin/engrenage/agents/index";
import debt from "#bin/engrenage/debt";
import eslint from "#bin/engrenage/eslint";
import eslintFix from "#bin/engrenage/eslintFix";
import eslintSuppress from "#bin/engrenage/eslintSuppress";
import gate from "#bin/engrenage/gate";
import init from "#bin/engrenage/init";
import issues from "#bin/engrenage/issues/index";
import jscpd from "#bin/engrenage/jscpd";
import pnpm from "#bin/engrenage/pnpm/index";
import prettier from "#bin/engrenage/prettier";
import prettierAll from "#bin/engrenage/prettierAll";
import prettierCheck from "#bin/engrenage/prettierCheck";
import structure from "#bin/engrenage/structure";
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
    "structure": structure,
    "gate": gate,
    "issues": issues,
    "debt": debt,
    "agents": agents,
    "pnpm": pnpm,
    "tsc": { command: tsc, aliases: ["typecheck"] },
    "tsc:dist": { command: tscDist, aliases: ["typecheck:dist"] },
    "vitest": vitest,
    "vitest:watch": vitestWatch,
    "vitest:coverage": vitestCoverage,
    "vitest:dist": vitestDist,
    "tsdown": tsdown,
    "vite": vite,
    "eslint": { command: eslint, aliases: ["lint"] },
    "eslint:fix": { command: eslintFix, aliases: ["lint:fix"] },
    "eslint:suppress": { command: eslintSuppress, aliases: ["lint:suppress"] },
    "jscpd": jscpd,
    "prettier": { command: prettier, aliases: ["format"] },
    "prettier:check": prettierCheck,
    "prettier:all": { command: prettierAll, aliases: ["format:all"] },
  },
});
