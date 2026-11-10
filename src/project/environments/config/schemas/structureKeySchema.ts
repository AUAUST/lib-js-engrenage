import { check, pipe, string } from "valibot";

export const structureKeySchema = pipe(
  string(),
  check((key) => {
    return key !== "" && key !== "." && key !== ".." && !key.includes("/");
  }, "Expected one path segment: never empty, `.`, `..` or containing `/`"),
);
