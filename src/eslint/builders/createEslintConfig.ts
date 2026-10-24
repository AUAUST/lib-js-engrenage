import { createBaseRules } from "#eslint/builders/createBaseRules";
import { createImportRules } from "#eslint/builders/createImportRules";
import { createPromiseRules } from "#eslint/builders/createPromiseRules";
import { createRestrictedSyntaxRules } from "#eslint/builders/createRestrictedSyntaxRules";
import { createStylisticRules } from "#eslint/builders/createStylisticRules";
import type { EslintConventions } from "#eslint/types/EslintConventions";
import { defineConfig } from "eslint/config";

export function createEslintConfig(conventions: EslintConventions) {
  return defineConfig([
    createBaseRules(conventions),
    createImportRules(conventions),
    createStylisticRules(),
    createRestrictedSyntaxRules(conventions),
    createPromiseRules(conventions),
  ]);
}
