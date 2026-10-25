import { defaultFixtureFiles } from "#config/constants";
import { globSchema } from "#config/config/schemas/globSchema";
import { optional } from "valibot";

export const fixtureFilesSchema = optional(globSchema, defaultFixtureFiles);
