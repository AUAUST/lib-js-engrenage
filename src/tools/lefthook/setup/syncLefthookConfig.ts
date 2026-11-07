import { isDeepStrictEqual } from "node:util";

import { isMap, isNode, parseDocument } from "yaml";

import { agentsSection, listLocalFilePatterns } from "#tools/agents/index";
import {
  gateCommandName,
  hookName,
  lefthookFile,
  localCommandName,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import type { LoadedConfig } from "#project/config/index";

export async function syncLefthookConfig(config: LoadedConfig) {
  const { resolve, context } = config;

  const content = await context.filesystem.read(lefthookFile);

  if (content === undefined) {
    return;
  }

  const variables = listGateVariables(await resolve(agentsSection));

  const local = await listLocalFilePatterns(config);

  const document = parseDocument(content);

  if (document.errors.length > 0) {
    throw new Error(`Cannot read ${lefthookFile}`, {
      cause: document.errors[0],
    });
  }

  if (document.contents !== null && !isMap(document.contents)) {
    throw new Error(`${lefthookFile} must contain a YAML mapping`);
  }

  const commands = renderGateCommand(variables, local.length > 0);

  let changed = false;

  for (const name of [gateCommandName, localCommandName] as const) {
    const path = [hookName, "commands", name];
    const command = commands[name];
    const current: unknown = document.getIn(path);

    if (
      isDeepStrictEqual(isNode(current) ? current.toJSON() : current, command)
    ) {
      continue;
    }

    if (command === undefined) {
      document.deleteIn(path);
    } else {
      for (const length of [1, 2]) {
        if (document.getIn(path.slice(0, length)) == null) {
          document.setIn(path.slice(0, length), document.createNode({}));
        }
      }

      document.setIn(path, document.createNode(command));
    }

    changed = true;
  }

  if (changed) {
    await context.filesystem.write(lefthookFile, document.toString());
  }
}
