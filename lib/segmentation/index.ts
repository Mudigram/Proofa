/**
 * lib/segmentation — behavioural segmentation model.
 * Public surface for admin APIs, the console, and tests.
 *
 * Layers: identity → events → attributes → scores → segments.
 * Everything re-exported here is pure and safe to call from tests or scripts.
 */

export * from "./types";
export { EVENTS, PRO_FEATURES, INTENT_WEIGHTS, GATE_OBJECTION, GATE_VARIANTS } from "./events";
export { buildAttributes, buildExportFacts, dayDiff } from "./attributes";
export {
    computeScores,
    engagementScore,
    purchaseIntentScore,
    healthScore,
    rfmBucket,
    scoreRecency,
    scoreFrequency,
    scoreMonetary,
    DEFAULT_POPULATION,
    SCORING_META,
} from "./scores";
export { assignStage, dormantThreshold, lostThreshold, STAGE_MEANING } from "./lifecycle";
export { SEGMENTS, SEGMENT_BY_ID, resolveSegments } from "./segments";
export {
    segmentAll,
    evaluateCustomer,
    deduplicateByTopPriority,
    buildPopulationStats,
    buildNarrative,
    isPayingPlan,
} from "./engine";