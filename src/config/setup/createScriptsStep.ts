import { filter, includes } from "@auaust/primitive-kit/arrays";
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
} from "#constants";
import type { Step } from "#support/scaffold/types/Step";
import type { StepContext } from "#support/scaffold/types/StepContext";

type Command = string | false;

interface Script {
  name: string;
  command: string;
}

function chain(commands: ReadonlyArray<Command>): string | false {
  const present = filter(commands, isString);

  return present.length > 0 && present.join(" && ");
}

function createBuildCommand(
  hasDependency: StepContext["hasDependency"],
): Command {
  if (hasDependency(tsdown)) {
    return chain([
      "engrenage tsdown",
      hasDependency(typescript) && "engrenage typecheck:dist",
      hasDependency(vitest) && "engrenage vitest:dist",
    ]);
  }

  return hasDependency(vite) && "engrenage vite build";
}

function collectScripts({
  getPresets,
  hasDependency,
}: StepContext): ReadonlyArray<Script> {
  const build = createBuildCommand(hasDependency);
  const typecheck = hasDependency(typescript) && "engrenage typecheck";
  const lint = hasDependency(eslint) && "engrenage eslint";
  const test = hasDependency(vitest) && "engrenage vitest";

  const publishes =
    includes(getPresets(), "library") && hasDependency(changesetsCli);

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
    "coverage": hasDependency(vitest) && "engrenage vitest:coverage",
    "format": hasDependency(prettier) && "engrenage format",
    "lint": lint,
    "ready": chain([
      "pnpm install --frozen-lockfile",
      "engrenage sync",
      "pnpm run ci",
    ]),
    "test": chain([test, typecheck]),
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

function findMissingScripts(context: StepContext): ReadonlyArray<Script> {
  return collectScripts(context).filter(({ name }) => {
    return context.readPackageJson(["scripts", name]) === undefined;
  });
}

export function createScriptsStep(): Step {
  return {
    name: "scripts",
    message: "Add the standard scripts?",
    isMissing(context) {
      return findMissingScripts(context).length > 0;
    },
    plan(context) {
      for (const { name, command } of findMissingScripts(context)) {
        context.writePackageJson(["scripts", name], command);
      }
    },
  };
}
