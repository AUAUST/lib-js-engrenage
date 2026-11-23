import { once } from "@auaust/toolkit/function";

import { discoverContext } from "#batiment/context/operations/discoverContext";
import { walkScope } from "#batiment/context/operations/walkScope";
import type { LoadedContext } from "#batiment/context/apis/LoadedContext";
import type { ContextPort } from "#batiment/context/ports/ContextPort";
import type { ResolvedStructure } from "#batiment/structure/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

export function load(
  context: ContextPort,
  filesystem: Filesystem,
): LoadedContext {
  const discover = once(() => discoverContext(context, filesystem));

  const walks = new Map<Directory, Promise<ResolvedStructure>>();

  async function walkOnce(dir: Directory): Promise<ResolvedStructure> {
    const discovery = await discover();

    const declarations = await context.scope(dir);

    return walkScope({
      dir,
      declarations,
      discovery,
      filesystem,
    });
  }

  function walk(dir: Directory): Promise<ResolvedStructure> {
    let walked = walks.get(dir);

    if (walked === undefined) {
      walked = walkOnce(dir);

      walks.set(dir, walked);
    }

    return walked;
  }

  return { discover, walk };
}
