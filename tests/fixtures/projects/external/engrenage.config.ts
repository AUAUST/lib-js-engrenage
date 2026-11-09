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
      title: "External fixture",
      owns: {
        keys: {
          externalFixture: {
            input: "externalFixture",
            load: async () => section,
          },
        },
        slots: { "externalFixture.entries": {} },
        files: {
          "externalFixture.output": {
            committed: false,
            locate: async () => ({ directory: "external-output" }),
          },
        },
      },
      contributes: {
        "sync.targets": [
          {
            name: "external-fixture",
            stage: "write",
            flags: { create: "create external-output/created.txt" },
            produces: ["externalFixture.output"],
            load: async () => {
              return async (
                config: {
                  context: {
                    filesystem: {
                      write(path: string, content: string): Promise<void>;
                    };
                  };
                },
                flags: { create?: boolean },
              ) => {
                if (flags.create === true) {
                  await config.context.filesystem.write(
                    "external-output/created.txt",
                    "created\n",
                  );
                }
              };
            },
          },
        ],
      },
    },
  ],
  externalFixture: { label: "listed" },
};
