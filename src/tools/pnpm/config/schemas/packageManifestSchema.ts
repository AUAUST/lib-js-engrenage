import { looseObject, optional, record, string, union } from "valibot";

// @debt a schema of a package's `package.json`, not of an option declaration; no role fits schemas of data files
export const packageManifestSchema = looseObject({
  name: string(),
  bin: optional(union([string(), record(string(), string())])),
  peerDependencies: optional(record(string(), string())),
});
