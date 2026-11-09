import * as v from "valibot";

const section = {
  declaration: {
    schema: v.optional(v.strictObject({ label: v.optional(v.string()) })),
    resolve: (input: { label?: string } | undefined) => input,
  },
  live: false,
  resolve: (input: { label?: string } | undefined) => ({
    label: input?.label ?? "external",
  }),
};

export default {
  extensions: [
    {
      name: "external-fixture",
      owns: {
        keys: {
          externalFixture: {
            input: "externalFixture",
            load: async () => section,
          },
        },
        slots: { "externalFixture.entries": {} },
      },
    },
  ],
  externalFixture: { label: "listed" },
};
