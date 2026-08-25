export type ExecutionRequestV2ValidationErrorCode =
  | "INVALID_CONTRACT_VERSION"
  | "MISSING_FIELD"
  | "UNKNOWN_FIELD"
  | "INVALID_TYPE"
  | "INVALID_VALUE"
  | "INVALID_CARDINALITY"
  | "DUPLICATE_BINDING"
  | "INVALID_REFERENCE"
  | "INVALID_DIGEST"
  | "INVALID_RUNTIME_VALUE";

export interface ExecutionRequestV2ValidationError {
  readonly code: ExecutionRequestV2ValidationErrorCode;
  readonly path: string;
  readonly message: string;
}
