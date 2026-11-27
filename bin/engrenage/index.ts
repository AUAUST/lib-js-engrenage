import { command } from "#nexus/cli/index";

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

export default command({
  name: "engrenage",
  description: packageJson.description,
  version: packageJson.version,
  positionalOptions: true,
  subcommands: [
    init,
    sync,
    gate,
    pnpm,
    link,
    tsc,
    tscDist,
    vitest,
    vitestWatch,
    vitestCoverage,
    vitestDist,
    tsdown,
    vite,
    eslint,
    eslintFix,
    eslintSuppress,
    jscpd,
    jscpdNew,
    prettier,
    prettierCheck,
    prettierAll,
  ],
});
