import type { DerivedLayout } from "#batiment/structure/ports/DerivedLayout";
import type { RecursiveLayout } from "#batiment/structure/ports/RecursiveLayout";
import type { StaticLayout } from "#batiment/structure/ports/StaticLayout";

/**
 * The shape of an environment's tree, in place of the namespace and domain walk.
 *
 * @experimental
 */
export type Layout = StaticLayout | RecursiveLayout | DerivedLayout;
