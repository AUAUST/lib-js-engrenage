import type { EntryShape } from "#foundation/extensions/index";

export interface LanguageEntry extends EntryShape {
  readonly name: string;
  readonly extensions: readonly string[];
  readonly modules?: boolean;
  readonly declarations?: string;
}

declare global {
  interface EngrenageSlots {
    languages: LanguageEntry;
  }
}
