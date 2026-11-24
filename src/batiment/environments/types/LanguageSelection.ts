export interface LanguageSelection {
  /**
   * Names the selected language.
   */
  readonly name: string;
  /**
   * The options the language is selected with, which the language validates;
   * unset, it takes its defaults.
   */
  readonly options?: Readonly<Record<string, unknown>> | undefined;
}
