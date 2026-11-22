import { integer, minValue, number, pipe } from "valibot";

export const budgetSchema = pipe(number(), integer(), minValue(1));
