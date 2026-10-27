import { map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

const branchKeywords = ["anyOf", "oneOf"];

function requiredOf(schema: Record<string, unknown>): unknown[] {
  return isArray(schema.required) ? schema.required : [];
}

function mergeRequirementBranches(
  schema: Record<string, unknown>,
  keyword: string,
): Record<string, unknown> {
  const { [keyword]: alternatives, ...base } = schema;

  if (base.properties == null || !isArray(alternatives)) {
    return schema;
  }

  const branches = alternatives.filter(isPlainObject);

  if (
    branches.length !== alternatives.length ||
    branches.some((branch) => branch.properties != null)
  ) {
    return schema;
  }

  return {
    [keyword]: map(branches, (branch) => {
      return {
        ...base,
        ...branch,
        required: [...requiredOf(base), ...requiredOf(branch)],
      };
    }),
  };
}

function normalizeSchemaNode(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  if (isString(schema.$ref)) {
    return {
      $ref: schema.$ref,
    };
  }

  return branchKeywords.reduce(mergeRequirementBranches, schema);
}

export function normalizeRuleSchema<Schema>(schema: Schema): Schema {
  if (schema == null) {
    return schema;
  }

  return JSON.parse(JSON.stringify(schema), (_key, value: unknown) => {
    return isPlainObject(value) ? normalizeSchemaNode(value) : value;
  });
}
