/**
 * How a file format writes block markers: a marker is a whole line of `open`,
 * `@<directive>` with its arguments, then `close`. `padding` surrounds the filled
 * content between the markers.
 */
export interface BlockSyntax {
  open: string;
  close: string;
  padding: string;
}
