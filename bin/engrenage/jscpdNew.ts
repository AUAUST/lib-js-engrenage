import { argument, command } from "#nexus/cli/index";

export default command({
  name: "jscpd:new",
  description: "List by name the clones added since a git ref.",
  arguments: [
    argument({
      name: "ref",
      description: "git ref the clones are compared with",
    }),
  ],
  action() {
    return import("#bin/engrenage/actions/jscpdNew");
  },
});
