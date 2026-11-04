import { declareObject } from "#options/utils/declareObject";
import { rolesOptionEntries } from "#structure/config/schemas/rolesOptionEntries";

export const rolesSchema = declareObject(rolesOptionEntries, {
  description:
    "The roles of the project, refined by each environment. `false` turns the role system off: no role is recognized and no role check or rule is produced.",
  optional: true,
  disable: {
    value: {
      enable: [],
      disable: [],
      define: {},
      aliases: {},
    },
  },
});
