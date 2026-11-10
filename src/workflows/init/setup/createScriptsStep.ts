import { filter } from "@auaust/primitive-kit/arrays";
import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

import {
  changesetsCli,
  eslint,
  prettier,
  tsdown,
  typescript,
  vite,
  vitest,
  vitestCoverageIstanbul,
} from "#constants";
import type { Step, StepContext } from "#project/steps/index";
import type { PackageName } from "#types/PackageName";

type Command = string | false;

interface Script {
  name: string;
  command: string;
}

function chain(commands: readonly Command[]): string | false {
  const present = filter(commands, isString);

  return present.length > 0 && present.join(" && ");
}

type HasDependency = (name: PackageName) => boolean;

async function resolveDependencies(
  hasDependency: StepContext["hasDependency"],
): Promise<HasDependency> {
  const names = [
    changesetsCli,
    eslint,
    prettier,
    tsdown,
    typescript,
    vite,
    vitest,
    vitestCoverageIstanbul,
  ];

  const installed = new Set<PackageName>();

  for (const name of names) {
    if (await hasDependency(name)) {
      installed.add(name);
    }
  }

  return (name) => installed.has(name);
}

function createBuildCommand(hasDependency: HasDependency): Command {
  if (hasDependency(tsdown)) {
    return chain([
      "engrenage tsdown",
      hasDependency(typescript) && "engrenage typecheck:dist",
      hasDependency(vitest) && "engrenage vitest:dist",
    ]);
  }

  return hasDependency(vite) && "engrenage vite build";
}

async function collectScripts({
  getTraits,
  hasDependency: hasInstalledDependency,
}: StepContext): Promise<readonly Script[]> {
  const hasDependency = await resolveDependencies(hasInstalledDependency);

  const build = createBuildCommand(hasDependency);

  const typecheck = hasDependency(typescript) && "engrenage typecheck";

  const lint = hasDependency(eslint) && "engrenage eslint";

  const test = hasDependency(vitest) && "engrenage vitest";

  const traits = await getTraits();

  const publishes = traits.published && hasDependency(changesetsCli);

  const scripts = {
    "build": build,
    "ci": chain([
      "pnpm run ci:check",
      test && "pnpm run ci:test",
      build && "pnpm run ci:build",
    ]),
    "ci:build": build && "pnpm run build",
    "ci:check": chain(["engrenage sync --check", typecheck, lint]),
    "ci:publish": publishes && "changeset publish",
    "ci:test": test,
    "coverage": (
      hasDependency(vitest) &&
      hasDependency(vitestCoverageIstanbul) &&
      "engrenage vitest:coverage"
    ),
    "format": hasDependency(prettier) && "engrenage prettier",
    "lint": lint,
    "lint:check": lint,
    "lint:fix": hasDependency(eslint) && "engrenage eslint:fix",
    "lint:suppress": hasDependency(eslint) && "engrenage eslint:suppress",
    "ready": chain([
      "pnpm install --frozen-lockfile",
      "engrenage sync",
      "pnpm run ci",
    ]),
    "test": chain([test, typecheck]),
    "typecheck": typecheck,
  };

  const defined: Script[] = [];

  for (const [name, command] of entries(scripts)) {
    if (isString(command)) {
      defined.push({
        name,
        command,
      });
    }
  }

  return defined;
}

async function findMissingScripts(
  context: StepContext,
): Promise<readonly Script[]> {
  const missing: Script[] = [];

  for (const script of await collectScripts(context)) {
    if (
      (await context.readPackageJson(["scripts", script.name])) === undefined
    ) {
      missing.push(script);
    }
  }

  return missing;
}

export function createScriptsStep(): Step {
  return {
    name: "scripts",
    message: "Add the standard scripts?",
    async isMissing(context) {
      const missing = await findMissingScripts(context);

      return missing.length > 0;
    },
    async plan(context) {
      for (const { name, command } of await findMissingScripts(context)) {
        await context.writePackageJson(["scripts", name], command);
      }
    },
  };
}
