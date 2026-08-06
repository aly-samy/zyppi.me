import type { RetrievedRegistryState } from "@zyppi/contracts";

export interface NormalizedConstitutionalError {
  readonly errorCode: string;
  readonly errorCategory: string;
  readonly errorReason: string;
}

export interface ReplayDiagnostic {
  readonly severity: "INFO" | "WARNING" | "ERROR";
  readonly code: string;
  readonly message: string;
  readonly caseId?: string;
}

export interface ReplayValidationResult {
  readonly passed: boolean;
  readonly status:
    | "IDENTICAL"
    | "DIVERGENT"
    | "INVALID_INPUT"
    | "INVALID_ERROR"
    | "NON_DETERMINISTIC";
  readonly digestBefore: string;
  readonly digestAfter: string;
  readonly diagnostics: readonly ReplayDiagnostic[];
}

export interface ReplayCaseExpectedOutput {
  readonly status:
    | "RESOLVED"
    | "NOT_FOUND"
    | "INVALID_INPUT"
    | "REGISTRY_FAILURE"
    | "INCOMPLETE_CONSTITUTIONAL_STATE";
  readonly primaryIdentifier?: {
    readonly ai: string;
    readonly value: string;
    readonly source: string;
  };
  readonly supportedQualifiers?: readonly {
    readonly ai: string;
    readonly value: string;
    readonly source: string;
  }[];
  readonly unsupportedContext?: readonly {
    readonly ai: string;
    readonly value: string;
    readonly source: string;
  }[];
  readonly registryState?: RetrievedRegistryState | null;
  readonly error?: NormalizedConstitutionalError;
}

export interface ReplayCase {
  readonly caseId: string;
  readonly description: string;
  readonly inputCarrier: string;
  readonly expectedOutput: ReplayCaseExpectedOutput;
}

export interface ReplayCorpus {
  readonly version: string;
  readonly cases: readonly ReplayCase[];
}

export type ReplayRegistrySnapshot = {
  readonly [canonicalId: string]: RetrievedRegistryState;
};

export interface ReplayReceipt {
  readonly replayVersion: string;
  readonly corpusVersion: string;
  readonly corpusHash: string;
  readonly registrySnapshotVersion: string;
  readonly registrySnapshotHash: string;
  readonly gitCommitSha: string;
  readonly nodeVersion: string;
  readonly digestBefore: string;
  readonly digestAfter: string;
  readonly replayStatus:
    | "IDENTICAL"
    | "DIVERGENT"
    | "INVALID_INPUT"
    | "INVALID_ERROR"
    | "NON_DETERMINISTIC";
  readonly diagnostics: readonly ReplayDiagnostic[];
  readonly executionTimestamp: string;
}
