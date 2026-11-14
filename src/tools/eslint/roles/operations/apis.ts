import { createRolePreset } from "#project/roles/index";

/**
 * Preset of the `apis` role: one type-only interface per module, checked by the
 * `api-interface` rule.
 */
export const apis = createRolePreset({
  name: "apis",
  purpose: "Interfaces of the objects the domain creates and hands out, one per module.",
  exports: "named-match",
  typeOnly: true,
  public: true,
  effects: "pure",
  rules: {
    "api-interface": async () => {
      const { apiInterface } = await import("#tools/eslint/rules/apiInterface");

      return apiInterface;
    },
  },
});
