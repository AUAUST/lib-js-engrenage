import { array, string } from "valibot";

import { declare } from "#foundation/options/index";

export function declareLanguages(description: string) {
  return declare(array(string()), {
    description,
    optional: { value: undefined },
  });
}
