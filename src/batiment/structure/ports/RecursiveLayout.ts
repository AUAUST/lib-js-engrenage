import type { Role } from "#batiment/roles/index";

/**
 * A tree of nodes: every directory that is no role is a node.
 *
 * @experimental
 */
export interface RecursiveLayout {
  /**
   * Tells this layout apart from the other natures.
   */
  readonly nature: "recursive";
  /**
   * The name environment kinds and options select the layout by.
   */
  readonly name: string;
  /**
   * The roles the files inside each node follow, added to the environment's
   * own roles.
   */
  readonly roles: readonly Role[];
  /**
   * What maps call a node (`label`) and how they describe the tree
   * (`description`).
   */
  readonly node: { readonly label: string; readonly description: string };
}
