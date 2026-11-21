/**
 * A tree derived from other environments.
 *
 * @experimental
 */
export interface DerivedLayout {
  /**
   * Tells this layout apart from the other natures.
   */
  readonly nature: "derived";
  /**
   * The name environment kinds and options select the layout by.
   */
  readonly name: string;
  /**
   * What the tree derives from: `counterparts` mirrors the counterpart
   * environments, each top directory naming one.
   */
  readonly from: "counterparts";
}
