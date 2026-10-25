import { optional } from "valibot";

import { fileSchema } from "#config/config/schemas/fileSchema";
import { defaultGitignoreFile } from "#config/constants";

export const gitignoreFileSchema = optional(fileSchema, defaultGitignoreFile);
