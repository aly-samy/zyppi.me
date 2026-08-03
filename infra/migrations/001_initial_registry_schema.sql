-- AMS-0501: PostgreSQL Registry Schema Migration
-- Standard: PostgreSQL 16
-- State: Authorized for Execution
-- Custom SQLSTATE P0001 is used to reject mutations on append-only tables (evidence, execution_receipts)

-- 1. referents table
CREATE TABLE referents (
    id UUID PRIMARY KEY,
    referent_type TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_referent_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_referents_type CHECK (referent_type IN ('product', 'brand', 'manufacturer')),
    CONSTRAINT fk_referents_parent FOREIGN KEY (parent_referent_id) REFERENCES referents(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- 2. identities table
CREATE TABLE identities (
    id UUID PRIMARY KEY,
    identity_type TEXT NOT NULL,
    canonical_reference TEXT NOT NULL,
    referent_id UUID,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_identities_status CHECK (status IN ('draft', 'active', 'decommissioned')),
    CONSTRAINT fk_identities_referent FOREIGN KEY (referent_id) REFERENCES referents(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- 3. evidence table (Immutable)
CREATE TABLE evidence (
    id UUID PRIMARY KEY,
    identity_id UUID NOT NULL,
    evidence_type TEXT NOT NULL,
    hash TEXT NOT NULL,
    storage_ref TEXT NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evidence_identity FOREIGN KEY (identity_id) REFERENCES identities(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- 4. policies table
CREATE TABLE policies (
    id UUID PRIMARY KEY,
    policy_type TEXT NOT NULL,
    version TEXT NOT NULL,
    definition JSONB NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. authorities table
CREATE TABLE authorities (
    id UUID PRIMARY KEY,
    subject_id TEXT NOT NULL,
    scope TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. capabilities table
CREATE TABLE capabilities (
    id UUID PRIMARY KEY,
    subject_id TEXT NOT NULL,
    scope TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. standings table
CREATE TABLE standings (
    id UUID PRIMARY KEY,
    subject_id TEXT NOT NULL,
    scope TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. execution_receipts table (Immutable)
CREATE TABLE execution_receipts (
    id UUID PRIMARY KEY,
    execution_id TEXT NOT NULL,
    runtime_version TEXT NOT NULL,
    input_hash TEXT NOT NULL,
    output_hash TEXT NOT NULL,
    evidence_hash TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    decision_summary JSONB NOT NULL,
    execution_time_ms BIGINT NOT NULL,
    deterministic_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Immutable Append-Only Enforcement Trigger Function
-- Throws custom SQLSTATE 'P0001' to prevent UPDATE and DELETE modifications
CREATE OR REPLACE FUNCTION reject_append_only_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Table is immutable and append-only.' USING ERRCODE = 'P0001';
END;
$$ LANGUAGE plpgsql;

-- Trigger associations for evidence table
CREATE TRIGGER evidence_append_only_update
    BEFORE UPDATE ON evidence
    FOR EACH ROW
    EXECUTE FUNCTION reject_append_only_mutation();

CREATE TRIGGER evidence_append_only_delete
    BEFORE DELETE ON evidence
    FOR EACH ROW
    EXECUTE FUNCTION reject_append_only_mutation();

-- Trigger associations for execution_receipts table
CREATE TRIGGER execution_receipts_append_only_update
    BEFORE UPDATE ON execution_receipts
    FOR EACH ROW
    EXECUTE FUNCTION reject_append_only_mutation();

CREATE TRIGGER execution_receipts_append_only_delete
    BEFORE DELETE ON execution_receipts
    FOR EACH ROW
    EXECUTE FUNCTION reject_append_only_mutation();
