import type { Layout } from "#batiment/structure/index";
import type { EntryShape } from "#foundation/extensions/index";
import type { Loadable } from "#foundation/modules/index";

export interface LayoutEntry extends EntryShape {
  /**
   * The name of the layout, which environment kinds and options select it by.
   */
  readonly name: string;
  /**
   * Loads the layout.
   */
  load(): Promise<Loadable<Layout>>;
}

declare global {
  namespace Engrenage {
    interface Slots {
      layouts: LayoutEntry;
    }
  }
}
