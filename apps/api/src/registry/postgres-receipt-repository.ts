import postgres from "postgres";
import type {
  ReceiptRepository,
  RegistryResult,
  PersistenceAcknowledgement,
} from "@zyppi/contracts";
import type { ExecutionReceipt } from "@zyppi/domain";
import { translateError } from "./errors.js";

export class PostgresReceiptRepository implements ReceiptRepository {
  private readonly sql: postgres.Sql;

  constructor(sql: postgres.Sql) {
    if (!sql) {
      throw new Error("Postgres SQL client is required");
    }
    this.sql = sql;
  }

  async save(
    receipt: ExecutionReceipt,
  ): Promise<RegistryResult<PersistenceAcknowledgement>> {
    try {
      // Passive write-only sink. Parse decisionSummary string to store as JSONB.
      const parsedDecisionSummary = JSON.parse(receipt.decisionSummary);

      await this.sql`
        INSERT INTO execution_receipts (
          id,
          execution_id,
          runtime_version,
          input_hash,
          output_hash,
          evidence_hash,
          policy_version,
          decision_summary,
          execution_time_ms,
          deterministic_hash
        ) VALUES (
          ${receipt.receiptId},
          ${receipt.executionId},
          ${receipt.runtimeVersion},
          ${receipt.inputHash},
          ${receipt.outputHash},
          ${receipt.evidenceHash},
          ${receipt.policyVersion},
          ${parsedDecisionSummary},
          ${Math.round(receipt.executionTime)},
          ${receipt.deterministicHash}
        )
      `;

      return { ok: true, value: {} };
    } catch (err) {
      return { ok: false, error: translateError(err) };
    }
  }
}
