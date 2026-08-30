export type ZqeStage =
  | "input_validation"
  | "data_encoding"
  | "ecc_generation"
  | "block_interleaving"
  | "matrix_construction"
  | "data_placement"
  | "mask_evaluation"
  | "format_generation"
  | "symbol_finalization"
  | "rendering";

export interface ZqeErrorShape {
  readonly code: string;
  readonly reason: string;
  readonly stage: ZqeStage;
  readonly reference: string;
  readonly recovery: string;
}

export class ZqeError extends Error implements ZqeErrorShape {
  readonly code: string;
  readonly reason: string;
  readonly stage: ZqeStage;
  readonly reference: string;
  readonly recovery: string;

  constructor(shape: ZqeErrorShape) {
    super(`[${shape.code}] ${shape.reason}`);
    this.name = "ZqeError";
    this.code = shape.code;
    this.reason = shape.reason;
    this.stage = shape.stage;
    this.reference = shape.reference;
    this.recovery = shape.recovery;
  }
}

export function createInvalidInputError(reason: string): ZqeError {
  return new ZqeError({
    code: "QR_INVALID_INPUT",
    reason,
    stage: "input_validation",
    reference: "ZQE-001 / Input validation rule",
    recovery: "Provide a valid Uint8Array instance as the data input.",
  });
}

export function createUnsupportedProfileError(profile: unknown): ZqeError {
  return new ZqeError({
    code: "QR_PROFILE_UNSUPPORTED",
    reason: `Unsupported QR profile '${String(profile)}'. Supported profile is 'zqe/fqr1'.`,
    stage: "input_validation",
    reference: "ZQE-001 / Profile selection rule",
    recovery: "Specify profile 'zqe/fqr1'.",
  });
}

export function createCapacityError(byteLength: number): ZqeError {
  return new ZqeError({
    code: "QR_CAPACITY_EXCEEDED",
    reason: `Input contains ${byteLength} bytes; zqe/fqr1 supports at most 42 bytes.`,
    stage: "input_validation",
    reference: "ZQE-001 / FQR capacity rule",
    recovery:
      "Provide 42 bytes or fewer, or use a future explicitly authorized profile.",
  });
}

export function createInternalInvariantError(
  reason: string,
  stage: ZqeStage = "data_encoding",
): ZqeError {
  return new ZqeError({
    code: "QR_INTERNAL_INVARIANT",
    reason,
    stage,
    reference: "ZQE-001 / Internal invariant failure",
    recovery:
      "Report this internal engine invariant failure to the ZQE maintainers.",
  });
}
