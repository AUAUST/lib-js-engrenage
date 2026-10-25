import { defaultGitignoreFile } from "#config/constants/defaultGitignoreFile";
import { fileSchema } from "#config/config/schemas/fileSchema";
import { optional } from "valibot";

export const gitignoreFileSchema = optional(fileSchema, defaultGitignoreFile);
