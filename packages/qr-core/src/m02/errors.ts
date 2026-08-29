export type ZqeStage =
  | "input_validation"
  | "data_encoding"
  | "ecc_generation"
  | "block_interleaving";

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
