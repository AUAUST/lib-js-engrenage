import { isDeepStrictEqual } from "node:util";

import { isMap, isNode, parseDocument } from "yaml";

import { listLocalFilePatterns } from "#tools/agents/index";
import {
  gateCommandName,
  hookName,
  lefthookFile,
  localCommandName,
  messageHookName,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import { renderMessageGateCommand } from "#tools/lefthook/utils/renderMessageGateCommand";
import type { LoadedConfig } from "#project/config/index";

export async function syncLefthookConfig(config: LoadedConfig) {
  const { resolve, context } = config;

  const content = await context.filesystem.read(lefthookFile);

  if (content === undefined) {
    return;
  }

  const variables = listGateVariables(await resolve("agents"));

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

  const targets = [
    [hookName, gateCommandName, commands[gateCommandName]],
    [hookName, localCommandName, commands[localCommandName]],
    [messageHookName, gateCommandName, renderMessageGateCommand(variables)],
  ] as const;

  let changed = false;

  for (const [hook, name, command] of targets) {
    const path = [hook, "commands", name];
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
