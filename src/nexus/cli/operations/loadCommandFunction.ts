import { isFunction } from "@auaust/toolkit";
import type { MaybePromise } from "@auaust/toolkit/types";

import { loadLazy, type Loadable } from "#foundation/modules/index";

/**
 * Loads a function one of the `name` command's layers needs, such as its action.
 *
 * @throws {TypeError} When `load` loads neither a function nor a module whose
 * default or only export is one.
 */
export async function loadCommandFunction<
  Loaded extends (...parameters: never[]) => unknown,
>(
  load: () => MaybePromise<Loadable<Loaded>>,
  name: string,
  kind: string,
): Promise<Loaded>;
export async function loadCommandFunction(
  load: () => unknown,
  name: string,
  kind: string,
): Promise<(...parameters: unknown[]) => unknown>;
export async function loadCommandFunction(
  load: () => unknown,
  name: string,
  kind: string,
): Promise<(...parameters: unknown[]) => unknown> {
  const loaded = await loadLazy<unknown>({ load });

  if (!isFunction(loaded)) {
    throw new TypeError(
      `The ${kind} of the ${name} command loads neither a function nor a module whose default or only export is one`,
    );
  }

  return loaded;
}
