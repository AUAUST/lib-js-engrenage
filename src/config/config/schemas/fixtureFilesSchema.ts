import { optional } from "valibot";

import { globSchema } from "#config/config/schemas/globSchema";
import { defaultFixtureFiles } from "#config/constants";

export const fixtureFilesSchema = optional(globSchema, defaultFixtureFiles);
