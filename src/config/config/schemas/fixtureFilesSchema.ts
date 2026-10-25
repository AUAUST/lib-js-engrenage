import { defaultFixtureFiles } from "#config/constants/defaultFixtureFiles";
import { globSchema } from "#config/config/schemas/globSchema";
import { optional } from "valibot";

export const fixtureFilesSchema = optional(globSchema, defaultFixtureFiles);
