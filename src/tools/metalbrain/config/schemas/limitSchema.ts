import { integer, minValue, number, pipe } from "valibot";

export const limitSchema = pipe(number(), integer(), minValue(1));
