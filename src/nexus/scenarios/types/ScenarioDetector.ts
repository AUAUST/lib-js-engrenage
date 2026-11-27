/**
 * Names the scenario the run's environment calls for, or `undefined` to defer
 * to the next detector.
 */
export type ScenarioDetector = () => string | undefined;
