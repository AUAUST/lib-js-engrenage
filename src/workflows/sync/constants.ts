import {
  array,
  function_,
  looseObject,
  optional,
  record,
  string,
} from "valibot";

export const syncTargetEntry = looseObject({
  name: string(),
  stage: string(),
  flags: optional(record(string(), string())),
  reads: optional(array(string())),
  produces: optional(array(string())),
  load: function_(),
});

export const syncDoneEntry = looseObject({
  name: optional(string()),
  load: function_(),
});
