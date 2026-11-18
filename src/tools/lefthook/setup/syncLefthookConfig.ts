import { isDeepStrictEqual } from "node:util";

import {
  isMap,
  isNode,
  parseDocument,
  visit,
  type Document,
  type Node,
} from "yaml";

import { entries } from "@auaust/toolkit/object";

import {
  everyoneCommandName,
  gateCommandName,
  gateHooks,
  lefthookFile,
} from "#tools/lefthook/constants";
import { listGateVariables } from "#tools/lefthook/utils/listGateVariables";
import { renderGateCommand } from "#tools/lefthook/utils/renderGateCommand";
import type { LoadedConfig } from "#project/config/index";

function listAnchored(node: unknown): Set<Node> {
  const anchored = new Set<Node>();

  if (isNode(node)) {
    visit(node, (_key, child) => {
      if (isNode(child) && child.anchor != null) {
        anchored.add(child);
      }
    });
  }

  return anchored;
}

function dropAnchors(node: Node): Node {
  visit(node, (_key, child) => {
    if (isNode(child)) {
      delete child.anchor;
    }
  });

  return node;
}

/**
 * Replaces each alias of an anchored node with an anchorless copy of it, so
 * rewriting or deleting that node leaves no alias unresolved.
 */
function inlineAliases(document: Document, sources: ReadonlySet<Node>): void {
  visit(document, {
    Alias(_key, alias) {
      const source = alias.resolve(document);

      if (source === undefined || !sources.has(source)) {
        return;
      }

      const copy = source.clone();

      if (!isNode(copy)) {
        throw new Error(`Cannot copy the anchored node of ${alias.source}`);
      }

      return dropAnchors(copy);
    },
  });
}

export async function syncLefthookConfig(config: LoadedConfig) {
  const { resolve, context } = config;

  const content = await context.filesystem.read(lefthookFile);

  if (content === undefined) {
    return;
  }

  const variables = listGateVariables(await resolve("agents"));

  const document = parseDocument(content);

  if (document.errors.length > 0) {
    throw new Error(`Cannot read ${lefthookFile}`, {
      cause: document.errors[0],
    });
  }

  if (document.contents !== null && !isMap(document.contents)) {
    throw new Error(`${lefthookFile} must contain a YAML mapping`);
  }

  const targets = entries(gateHooks).flatMap(([hook, run]) => {
    const commands = renderGateCommand(variables, run);

    return [
      [hook, gateCommandName, commands[gateCommandName]],
      [hook, everyoneCommandName, commands[everyoneCommandName]],
    ] as const;
  });

  let changed = false;

  for (const [hook, name, command] of targets) {
    const path = [hook, "commands", name];
    const current: unknown = document.getIn(path, true);

    const anchored = listAnchored(current);

    if (
      isDeepStrictEqual(
        isNode(current) ? current.toJSON() : current,
        command,
      ) &&
      anchored.size === 0
    ) {
      continue;
    }

    inlineAliases(document, anchored);

    if (command === undefined) {
      document.deleteIn(path);
    } else {
      for (const length of [1, 2]) {
        if (document.getIn(path.slice(0, length)) == null) {
          document.setIn(path.slice(0, length), document.createNode({}));
        }
      }

      document.setIn(
        path,
        document.createNode(command, {
          aliasDuplicateObjects: false,
        }),
      );
    }

    changed = true;
  }

  if (changed) {
    await context.filesystem.write(lefthookFile, document.toString());
  }
}
