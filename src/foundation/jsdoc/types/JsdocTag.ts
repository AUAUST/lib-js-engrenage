export interface JsdocTag {
  name: string;
  text: string;
  range: readonly [start: number, end: number];
}
