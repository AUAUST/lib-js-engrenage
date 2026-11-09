export interface EntryShape {
  readonly name?: string;
  readonly stage?: string;
  readonly reads?: readonly string[];
  readonly produces?: readonly string[];
}
