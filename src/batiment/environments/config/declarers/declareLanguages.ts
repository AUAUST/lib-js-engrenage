import { environmentPresetFields } from "#batiment/environments/constants";
import { declare } from "#foundation/options/index";

export function declareLanguages(description: string) {
  return declare(environmentPresetFields.languages.wrapped, {
    description,
    optional: { value: undefined },
  });
}
