import React from "react";

/**
 * Utility function to emulate network latency in asynchronous B2B actions.
 * @param {number} ms - Milliseconds of simulated delay. Defaults to 250ms.
 * @returns {Promise<void>}
 */
export function simulateNetwork(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
