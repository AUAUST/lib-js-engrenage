import { Document } from "yaml";

import { isString } from "@auaust/toolkit/isString";

import { lefthook } from "#constants";
import { agentsSection } from "#tools/agents/index";
import {
  gateCommandName,
  hookName,
  installCommand,
  lefthookFile,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import type { Step, StepContext } from "#project/steps/index";

const prepareLocation: [string, string] = ["scripts", "prepare"];

async function listVariables({ resolve }: StepContext) {
  return listGateVariables(await resolve(agentsSection));
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
    message: `Run the commit gate for agent commits with lefthook (${lefthookFile})?`,
    async isMissing(context) {
      const variables = await listVariables(context);

      return (
        variables.length > 0 && !(await context.filesystem.exists(lefthookFile))
      );
    },
    async plan(context) {
      const variables = await listVariables(context);

      await context.addDevDependency(lefthook);

      await writePrepare(context);

      await context.filesystem.write(
        lefthookFile,
        new Document({
          [hookName]: {
            commands: { [gateCommandName]: renderGateCommand(variables) },
          },
        }).toString(),
      );

      context.invoke({
        command: "pnpm",
        args: ["exec", ...installCommand.split(" ")],
        interactive: false,
      });
    },
  };
}
