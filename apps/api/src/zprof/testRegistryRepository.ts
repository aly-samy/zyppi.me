import type {
  RegistryRepository,
  RetrievedRegistryState,
  RegistryResult,
  ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
import type { EvidenceRecord } from "@zyppi/domain";

export class TestRegistryRepository implements RegistryRepository {
  constructor(
    private readonly state: RetrievedRegistryState | null,
    private readonly evidenceRecords: readonly EvidenceRecord[] = [],
    private readonly simulateError?: boolean,
  ) {}

  async lookup(
    identifier: ValidatedCanonicalIdentifier,
  ): Promise<RegistryResult<RetrievedRegistryState | null>> {
    void identifier;
    if (this.simulateError) {
      return { ok: false, error: { kind: "InfrastructureUnavailable" } };
    }
    return { ok: true, value: this.state };
  }

  async lookupEvidenceByIds(
    evidenceIds: readonly string[],
  ): Promise<RegistryResult<readonly EvidenceRecord[]>> {
    if (this.simulateError) {
      return { ok: false, error: { kind: "InfrastructureUnavailable" } };
    }
    const matched = this.evidenceRecords.filter((e) =>
      evidenceIds.includes(e.evidenceId),
    );
    return { ok: true, value: matched };
  }
}
