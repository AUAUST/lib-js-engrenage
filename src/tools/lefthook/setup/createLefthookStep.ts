import { Document } from "yaml";

import { isString } from "@auaust/toolkit/isString";
import { entries, record } from "@auaust/toolkit/object";

import { lefthook } from "#constants";
import {
  gateHooks,
  installCommand,
  lefthookFile,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import { createPnpmInvocation } from "#tools/pnpm/index";
import type { Step, StepContext } from "#project/steps/index";

const prepareLocation: [string, string] = ["scripts", "prepare"];

async function renderHooks(context: StepContext) {
  const variables = listGateVariables(await context.resolve("agents"));

  return record(
    entries(gateHooks).map(([hook, run]) => {
      return [hook, { commands: renderGateCommand(variables, run) }] as const;
    }),
  );
}

async function writePrepare({
  readPackageJson,
  writePackageJson,
}: StepContext) {
  const prepare = await readPackageJson(prepareLocation);

  if (prepare === undefined) {
    await writePackageJson(prepareLocation, installCommand);
  } else if (isString(prepare) && !prepare.includes(installCommand)) {
    await writePackageJson(prepareLocation, `${prepare} && ${installCommand}`);
  }
}

export function createLefthookStep(): Step {
  return {
    name: lefthookFile,
    message: `Run the commit gate with lefthook (${lefthookFile})?`,
    async isMissing(context) {
      return !(await context.filesystem.exists(lefthookFile));
    },
    async plan(context) {
      const hooks = await renderHooks(context);

      await context.addDevDependency(lefthook);

      await writePrepare(context);

      await context.filesystem.write(
        lefthookFile,
        new Document(hooks, null, {
          aliasDuplicateObjects: false,
        }).toString(),
      );

      context.invoke(
        createPnpmInvocation(["exec", ...installCommand.split(" ")]),
      );
    },
  };
}
