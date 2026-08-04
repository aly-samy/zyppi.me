export type SeedExecutionOutcome =
  | {
      readonly kind: "Success";
      readonly manifestId: string;
      readonly materializedRecordCount: number;
    }
  | {
      readonly kind: "AlreadyMaterialized";
      readonly manifestId: string;
      readonly materializedRecordCount: number;
    }
  | {
      readonly kind: "StateDiverged";
      readonly manifestId: string;
      readonly reasonCode: string;
    }
  | {
      readonly kind: "PartialStateAnomaly";
      readonly manifestId: string;
      readonly presentRecordCount: number;
      readonly absentRecordCount: number;
    }
  | {
      readonly kind: "IntegrityRefusal";
      readonly manifestId?: string;
      readonly reasonCode: string;
    }
  | {
      readonly kind: "AuthorityRefusal";
      readonly manifestId?: string;
      readonly reasonCode: string;
    }
  | {
      readonly kind: "ValidationRefusal";
      readonly manifestId?: string;
      readonly reasonCode: string;
    }
  | {
      readonly kind: "InfrastructureFailure";
      readonly reasonCode: string;
    };
