import type { JsdocTag } from "#foundation/jsdoc/types/JsdocTag";

export interface JsdocBlock {
  range: readonly [start: number, end: number];
  indent: string;
  description: string;
  tags: readonly JsdocTag[];
}
