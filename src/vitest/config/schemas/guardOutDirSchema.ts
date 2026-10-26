import { boolean, optional } from "valibot";

export const guardOutDirSchema = optional(boolean(), true);
