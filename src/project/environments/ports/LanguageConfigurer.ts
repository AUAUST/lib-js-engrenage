/**
 * Gives the extensions a language's files take beyond its own under the options
 * an environment selects it with.
 *
 * @throws {Error} The language does not accept the options.
 */
export type LanguageConfigurer = (
  options: Readonly<Record<string, unknown>>,
) => readonly string[];
