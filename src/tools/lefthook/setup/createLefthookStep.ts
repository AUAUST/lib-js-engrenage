import { Document } from "yaml";

import { isString } from "@auaust/toolkit/isString";
import { keys } from "@auaust/toolkit/object";

import { lefthook } from "#constants";
import { agentsSection, listLocalFilePatterns } from "#tools/agents/index";
import {
  hookName,
  installCommand,
  lefthookFile,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import type { Step, StepContext } from "#project/steps/index";

const prepareLocation: [string, string] = ["scripts", "prepare"];

async function listCommands(context: StepContext) {
  const variables = listGateVariables(await context.resolve(agentsSection));
  const local = await listLocalFilePatterns(context);

  return renderGateCommand(variables, local.length > 0);
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
      const commands = await listCommands(context);

      return (
        keys(commands).length > 0 &&
        !(await context.filesystem.exists(lefthookFile))
      );
    },
    async plan(context) {
      const commands = await listCommands(context);

      await context.addDevDependency(lefthook);

      await writePrepare(context);

      await context.filesystem.write(
        lefthookFile,
        new Document({
          [hookName]: {
            commands,
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
