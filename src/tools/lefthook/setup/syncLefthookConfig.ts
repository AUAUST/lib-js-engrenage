import { isDeepStrictEqual } from "node:util";

import { isMap, isNode, parseDocument } from "yaml";

import { agentsSection } from "#tools/agents/index";
import {
  gateCommandName,
  hookName,
  lefthookFile,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import type { LoadedConfig } from "#project/config/index";

export async function syncLefthookConfig({ resolve, context }: LoadedConfig) {
  const variables = listGateVariables(await resolve(agentsSection));

  const content = await context.filesystem.read(lefthookFile);

  if (variables.length === 0 || content === undefined) {
    return;
  }

  const document = parseDocument(content);

  if (document.errors.length > 0) {
    throw new Error(`Cannot read ${lefthookFile}`, {
      cause: document.errors[0],
    });
  }

  if (document.contents !== null && !isMap(document.contents)) {
    throw new Error(`${lefthookFile} must contain a YAML mapping`);
  }

  const path = [hookName, "commands", gateCommandName];

  const command = renderGateCommand(variables);

  const current: unknown = document.getIn(path);

  if (
    isDeepStrictEqual(isNode(current) ? current.toJSON() : current, command)
  ) {
    return;
  }

  for (const length of [1, 2]) {
    if (document.getIn(path.slice(0, length)) == null) {
      document.setIn(path.slice(0, length), document.createNode({}));
    }
  }

  document.setIn(path, document.createNode(command));

  await context.filesystem.write(lefthookFile, document.toString());
}
