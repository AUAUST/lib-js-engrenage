import { array, optional, string } from "valibot";

export const bundleSchema = optional(array(string()), []);
