/**
 * @experimental
 */
export interface DocTag {
  readonly name: string;
  readonly type?: string;
  readonly subject?: string;
  readonly value: unknown;
}
