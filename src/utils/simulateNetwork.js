/**
 * Emulates realistic background request latency based on transaction weight.
 * Supports:
 * - 'small'  (200ms): Read and autocompletion/lookup services.
 * - 'medium' (600ms): Fetching relational datasets and details pane profiles.
 * - 'large'  (1200ms): Mutation commits and bulky relational writes.
 * 
 * @param {('small'|'medium'|'large'|number)} sizeOrMs - Preset weight or numerical duration.
 * @returns {Promise<void>}
 */
export function simulateNetwork(sizeOrMs = "small") {
  let delay = 200;
  if (typeof sizeOrMs === "number") {
    delay = sizeOrMs;
  } else {
    switch (sizeOrMs) {
      case "small":
        delay = 200;
        break;
      case "medium":
        delay = 600;
        break;
      case "large":
        delay = 1200;
        break;
      default:
        delay = 200;
    }
  }
  return new Promise((resolve) => setTimeout(resolve, delay));
}
