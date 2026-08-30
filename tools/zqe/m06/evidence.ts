import { createHash } from "crypto";

export interface EvidenceRecord {
  payloadId: string;
  transformId: string;
  parameters: Record<string, unknown>;
  dimensions: { width: number; height: number };
  encodedImageSha256: string;
  decoderOutcome: "SUCCESS" | "DECODE_FAILED" | "NO_BARCODE";
  decodedPayloadSha256?: string;
  status: "PASS" | "FAIL";
}

export function sha256Hex(data: Uint8Array | string): string {
  return createHash("sha256").update(data).digest("hex");
}
