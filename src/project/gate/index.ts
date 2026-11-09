// @barrel ports/*.ts all
export * from "#project/gate/ports/GateResult";
export * from "#project/gate/ports/GateRun";
export * from "#project/gate/ports/GateStage";
export * from "#project/gate/ports/GateStepEntry";
// @end

// @barrel operations/*.ts named
export { runGateBinary } from "#project/gate/operations/runGateBinary";
export { runGateCli } from "#project/gate/operations/runGateCli";
export { runGateProcess } from "#project/gate/operations/runGateProcess";
// @end
