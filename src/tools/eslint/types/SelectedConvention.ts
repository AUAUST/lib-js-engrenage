import type { Convention } from "#tools/eslint/types/Convention";

export interface SelectedConvention {
  readonly category: string;
  readonly name: string;
  readonly convention: Convention;
}
