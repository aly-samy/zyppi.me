import type { EvidenceBundle } from "@zyppi/domain";

export interface ObjectStorageClient {
  getObject(storageRef: string): Promise<string | null>;
}

export type PayloadProviderError =
  | { readonly kind: "PAYLOAD_NOT_FOUND"; readonly evidenceId: string }
  | {
      readonly kind: "INVALID_PAYLOAD";
      readonly evidenceId: string;
      readonly reason: string;
    }
  | { readonly kind: "STORAGE_FAILURE"; readonly cause: string };

export type PayloadProviderResult =
  | { readonly ok: true; readonly value: ReadonlyMap<string, unknown> }
  | { readonly ok: false; readonly error: PayloadProviderError };

export interface EvidencePayloadProvider {
  loadPayloads(bundle: EvidenceBundle): Promise<PayloadProviderResult>;
}
