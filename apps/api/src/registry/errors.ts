import type { RegistryError } from "@zyppi/contracts";
import { MappingError } from "./mappers.js";

/**
 * Centrally translates any caught exception into the closed RegistryError taxonomy.
 * Exposes NO driver-specific types, database details, or SQLSTATE codes to callers.
 */
export function translateError(err: unknown): RegistryError {
  if (err instanceof MappingError) {
    return { kind: "DataCorruption" };
  }

  const error = err as Record<string, unknown> & Error;
  const message = error.message || "";
  const code = String(error.code || "");

  // Detect Infrastructure Unavailability:
  // - ECONNREFUSED, ETIMEDOUT, ENOTFOUND, EHOSTUNREACH, etc.
  // - Message contains "connection refused", "connect ECONNREFUSED", or "connection timeout"
  const isConnRefused =
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ENOTFOUND" ||
    code === "EHOSTUNREACH" ||
    code === "EPIPE" ||
    message.toLowerCase().includes("connection refused") ||
    message.toLowerCase().includes("connect econnrefused") ||
    message.toLowerCase().includes("connection timeout") ||
    message.toLowerCase().includes("failed to connect") ||
    message.toLowerCase().includes("socket");

  if (isConnRefused) {
    return { kind: "InfrastructureUnavailable" };
  }

  // Detect Data Corruption:
  // - Any MappingError is already caught above.
  // - Decollation / JSON parsing issues can occur if database contains invalid JSON string in columns we parse.
  // - If any domain validator failed, it would throw MappingError.
  if (
    message.toLowerCase().includes("json") ||
    err instanceof SyntaxError
  ) {
    return { kind: "DataCorruption" };
  }

  // All other errors default to OperationFailed to remain strictly fail-closed:
  // - Duplicate key violations (SQLSTATE '23505')
  // - Trigger rejections (SQLSTATE 'P0001')
  // - Query syntax errors
  // - Null constraint violations
  return { kind: "OperationFailed" };
}
