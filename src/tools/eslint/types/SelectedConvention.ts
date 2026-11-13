import type { Convention } from "#tools/eslint/ports/Convention";

export interface SelectedConvention {
  readonly category: string;
  readonly name: string;
  readonly convention: Convention;
}
