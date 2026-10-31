import { integer, minValue, number, pipe } from "valibot";

export const nodeMajorSchema = pipe(number(), integer(), minValue(1));
