import { declareObject } from "#foundation/options/index";
import { rolesOptionEntries } from "#project/structure/config/schemas/rolesOptionEntries";

export const rolesOptionSchema = declareObject(rolesOptionEntries, {
  description:
    "Roles of the directories and files whose names carry a fixed meaning.",
  optional: true,
});
