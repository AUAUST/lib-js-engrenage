import { map } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { alpha } from "#project/docs/utils/alpha";
import { author } from "#project/docs/utils/author";
import { beta } from "#project/docs/utils/beta";
import { callback } from "#project/docs/utils/callback";
import { classdesc } from "#project/docs/utils/classdesc";
import { defaultTag } from "#project/docs/utils/defaultTag";
import { defaultValue } from "#project/docs/utils/defaultValue";
import { deprecated } from "#project/docs/utils/deprecated";
import { desc } from "#project/docs/utils/desc";
import { description } from "#project/docs/utils/description";
import { eventProperty } from "#project/docs/utils/eventProperty";
import { example } from "#project/docs/utils/example";
import { experimental } from "#project/docs/utils/experimental";
import { internal } from "#project/docs/utils/internal";
import { license } from "#project/docs/utils/license";
import { module } from "#project/docs/utils/module";
import { overload } from "#project/docs/utils/overload";
import { override } from "#project/docs/utils/override";
import { packageDocumentation } from "#project/docs/utils/packageDocumentation";
import { param } from "#project/docs/utils/param";
import { privateRemarks } from "#project/docs/utils/privateRemarks";
import { privateTag } from "#project/docs/utils/privateTag";
import { property } from "#project/docs/utils/property";
import { protectedTag } from "#project/docs/utils/protectedTag";
import { publicTag } from "#project/docs/utils/publicTag";
import { readonly } from "#project/docs/utils/readonly";
import { remarks } from "#project/docs/utils/remarks";
import { returns } from "#project/docs/utils/returns";
import { satisfies } from "#project/docs/utils/satisfies";
import { sealed } from "#project/docs/utils/sealed";
import { see } from "#project/docs/utils/see";
import { since } from "#project/docs/utils/since";
import { stable } from "#project/docs/utils/stable";
import { template } from "#project/docs/utils/template";
import { throws } from "#project/docs/utils/throws";
import { type } from "#project/docs/utils/type";
import { typedef } from "#project/docs/utils/typedef";
import { typeParam } from "#project/docs/utils/typeParam";
import { virtual } from "#project/docs/utils/virtual";
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
