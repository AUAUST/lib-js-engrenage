import { pipe, record, regex, string } from "valibot";

const segment = String.raw`(?:[^/.][^/]*|\.[^/.][^/]*|\.\.[^/]+)`;

const relativePathSchema = pipe(
  string(),
  regex(
    new RegExp(`^${segment}(?:/${segment})*$`),
    "Expected a relative path without empty, `.` or `..` segments",
  ),
);

export const domainExportsSchema = record(
  relativePathSchema,
  relativePathSchema,
);
