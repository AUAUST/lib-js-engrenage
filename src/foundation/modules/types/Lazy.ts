import type { MaybePromise } from "@auaust/toolkit/types";

import type { Loadable } from "#foundation/modules/types/Loadable";

export interface Lazy<T> {
  /**
   * Loads the value, or a module whose `default` export, or else only value
   * export, is the value; any other result is the value itself.
   */
  load(): MaybePromise<Loadable<T>>;
}
