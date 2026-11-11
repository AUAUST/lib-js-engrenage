import {
  array,
  boolean,
  nullable,
  number,
  object,
  optional,
  record,
  string,
} from "valibot";

const entitySchema = {
  id: number(),
  nodeId: string(),
  name: string(),
  description: nullable(string()),
};

// @debt a schema of a generated data file, not of an option declaration; no role fits schemas of data files
export const githubSnapshotSchema = object({
  repositories: record(
    string(),
    object({
      repository: string(),
      id: number(),
      nodeId: string(),
      labels: array(object(entitySchema)),
    }),
  ),
  organizations: record(
    string(),
    object({
      types: array(
        object({
          ...entitySchema,
          enabled: boolean(),
          pinnedFields: array(string()),
        }),
      ),
      fields: array(
        object({
          ...entitySchema,
          dataType: string(),
          visibility: optional(string()),
          options: array(
            object({
              id: number(),
              name: string(),
              description: nullable(string()),
            }),
          ),
        }),
      ),
    }),
  ),
});
