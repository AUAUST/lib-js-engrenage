import type { RestrictedProperty } from "#eslint/types/RestrictedProperty";

export const restrictedProperties: RestrictedProperty[] = [
  {
    object: "Object",
    message: "Use the @auaust/toolkit/object equivalent.",
  },
  {
    object: "Array",
    property: "isArray",
    message: "Use isArray from @auaust/toolkit.",
  },
];
