import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";

export interface EnvironmentLanguage extends LanguageEntry {
  /**
   * The options the environment selects the language with, which its `extensions`
   * already reflect.
   */
  readonly options: Readonly<Record<string, unknown>>;
}
