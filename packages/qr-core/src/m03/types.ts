export type QrEcc = "L" | "M" | "Q" | "H";

export type QrMask = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ZqeProfileId = "zqe/fqr1";

export interface QrSymbol {
  readonly model: "QR_MODEL_2";
  readonly version: number;
  readonly size: number;
  readonly errorCorrection: QrEcc;
  readonly mask: QrMask;
  getModule(x: number, y: number): boolean;
}

export interface WorkingMatrix {
  readonly size: number;
  readonly modules: boolean[][];
  readonly isFunction: boolean[][];
}
