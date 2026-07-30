/* eslint-disable @typescript-eslint/no-unused-vars */
// Valid pure Runtime source
import { something } from "@zyppi/domain";
import { other } from "@zyppi/shared";

export function doubleValue(n: number): number {
  return n * 2;
}

export function getDateString(timestamp: number): string {
  // Parameterised Date constructor passes deterministic validation
  return new Date(timestamp).toISOString();
}
