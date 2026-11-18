import { map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { alpha } from "#project/docs/presets/alpha";
import { author } from "#project/docs/presets/author";
import { beta } from "#project/docs/presets/beta";
import { callback } from "#project/docs/presets/callback";
import { classdesc } from "#project/docs/presets/classdesc";
import { defaultTag } from "#project/docs/presets/defaultTag";
import { defaultValue } from "#project/docs/presets/defaultValue";
import { deprecated } from "#project/docs/presets/deprecated";
import { desc } from "#project/docs/presets/desc";
import { description } from "#project/docs/presets/description";
import { eventProperty } from "#project/docs/presets/eventProperty";
import { example } from "#project/docs/presets/example";
import { experimental } from "#project/docs/presets/experimental";
import { internal } from "#project/docs/presets/internal";
import { license } from "#project/docs/presets/license";
import { module } from "#project/docs/presets/module";
import { overload } from "#project/docs/presets/overload";
import { override } from "#project/docs/presets/override";
import { packageDocumentation } from "#project/docs/presets/packageDocumentation";
import { param } from "#project/docs/presets/param";
import { privateRemarks } from "#project/docs/presets/privateRemarks";
import { privateTag } from "#project/docs/presets/privateTag";
import { property } from "#project/docs/presets/property";
import { protectedTag } from "#project/docs/presets/protectedTag";
import { publicTag } from "#project/docs/presets/publicTag";
import { readonly } from "#project/docs/presets/readonly";
import { remarks } from "#project/docs/presets/remarks";
import { returns } from "#project/docs/presets/returns";
import { satisfies } from "#project/docs/presets/satisfies";
import { sealed } from "#project/docs/presets/sealed";
import { see } from "#project/docs/presets/see";
import { since } from "#project/docs/presets/since";
import { stable } from "#project/docs/presets/stable";
import { template } from "#project/docs/presets/template";
import { throws } from "#project/docs/presets/throws";
import { type } from "#project/docs/presets/type";
import { typedef } from "#project/docs/presets/typedef";
import { typeParam } from "#project/docs/presets/typeParam";
import { virtual } from "#project/docs/presets/virtual";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

const docTagPresets = freeze([
  description,
  desc,
  classdesc,
  remarks,
  module,
  packageDocumentation,
  example,
  typeParam,
  template,
  param,
  property,
  typedef,
  callback,
  type,
  satisfies,
  returns,
  throws,
  defaultTag,
  defaultValue,
  deprecated,
  see,
  author,
  since,
  license,
  privateRemarks,
  overload,
  override,
  virtual,
  sealed,
  readonly,
  internal,
  eventProperty,
  publicTag,
  privateTag,
  protectedTag,
  alpha,
  beta,
  stable,
  experimental,
] as const);

export function listConventionalTags(): readonly TagDeclaration[] {
  return freeze(map(docTagPresets, (preset) => preset()));
}
