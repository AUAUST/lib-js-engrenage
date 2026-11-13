import type { EntryShape } from "#foundation/extensions/index";

export interface LanguageEntry extends EntryShape {
  /**
   * Names the language; ESLint's files and the import aliases target the one
   * named `typescript`, and throw when it is absent.
   */
  readonly name: string;
  /**
   * The file extensions, dot included, at least one; aliases target the first.
   */
  readonly extensions: readonly string[];
  /**
   * Whether the language's files are modules: workspace entries and the import
   * cycle check include them.
   */
  readonly modules?: boolean;
  /**
   * The suffix of the language's declaration files, which aliases and the import
   * cycle check leave out.
   */
  readonly declarations?: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      languages: LanguageEntry;
    }
  }
}
