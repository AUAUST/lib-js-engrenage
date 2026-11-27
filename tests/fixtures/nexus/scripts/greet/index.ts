import { command, getRunContext, program } from "#nexus/cli/index";

export default program({
  root: command({
    name: "hello",
    action() {
      return Promise.resolve(() => {
        getRunContext().reporter.log("greeted");
      });
    },
  }),
});
