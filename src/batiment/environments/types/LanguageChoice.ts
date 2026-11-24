import type { LanguageSelection } from "#batiment/environments/types/LanguageSelection";

/**
 * A language an environment selects: its name, taking its defaults, or a
 * selection with options.
 */
export type LanguageChoice = string | LanguageSelection;
