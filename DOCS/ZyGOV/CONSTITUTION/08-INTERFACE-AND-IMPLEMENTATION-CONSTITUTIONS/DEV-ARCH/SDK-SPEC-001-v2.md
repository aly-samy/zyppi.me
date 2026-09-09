# CRL-SDK-002 — SDK-SPEC-001-v2.md Constitutional Resolution Log

**Specification:** SDK-SPEC-001-v2.md
**Audit Round:** 2
**Date:** 2024-06-29

## Finding Classification

| Severity | Meaning |
|---|---|
| Critical | Constitutional contradiction |
| High | Behavioral ambiguity |
| Medium | Architectural improvement |
| Low | Editorial improvement |

---

# Pass 1 — Constitutional Integrity Audit

## Pass 1 Findings

### Finding 1.1 — Ambiguity of "Official SDK" Definition

**Severity:** High

**Finding**

The definition of an "Official Zyppi SDK" is inconsistent between the Scope (Section 4) and Community Governance (Section 22.6).

**Evidence**

- **Section 4 (Official SDK Definition):** "An **Official Zyppi SDK** is any SDK that: successfully passes the Zyppi SDK Conformance Test Suite; and carries a valid Zyppi Trust Attestation... Official status is determined through constitutional conformance—not organizational ownership."
- **Section 22.6.1 (Official Stewardship):** "Official stewardship SHALL NOT grant additional constitutional authority... An Official SDK that has not successfully completed Certification... SHALL NOT be considered Certified for that version. Its official stewardship SHALL remain unchanged."

**Why it matters**

If "Official" status is determined solely by Certification (Section 4), then a revoked or uncertified SDK cannot be called "Official". However, Section 22.6.1 suggests that "Official" status is a property of stewardship/origin that remains even if Certification is lost. This creates a loophole where "Official" could be used as a marketing term for uncertified software.

**Recommended fix**

Decouple the terms. Use "Certified SDK" to refer to the conformance status and "Stewardship-Origin" (e.g., "Zyppi-Authored") to refer to authorship. Redefine Section 4 to define "Certified SDK" and update Section 22.6.1 to clarify that Stewardship does not imply current Certification.

**Impact if ignored**

Ecosystem confusion where users may trust "Official" SDKs that are not currently "Certified".


---

### Finding 1.2 — Implementation Prescription in "Out-of-Process" Requirement

**Severity:** Critical

**Finding**

Section 11.4 mandates "out-of-process execution", which directly contradicts the specification's core principle of implementation non-prescription.

**Evidence**

- **Section 11.4 (Tier 1 Requirements):** "Tier 1 Production Extensions SHALL additionally comply with **out-of-process execution** requirements..."
- **Section 1 (Purpose):** "SDK-SPEC-001 does **not** describe, prescribe, or constrain the internal implementation mechanics of any individual SDK."
- **Section 23.2 (SDK Constitutional Position):** "SDK-SPEC-001 SHALL NOT prescribe implementation."
- **Section 20.15.2 (Runtime Isolation):** "The technical isolation mechanism is implementation-specific."

**Why it matters**

Mandating a specific architectural pattern (out-of-process) violates the "Implementation Independence" principle (Section 17.2.4). While the goal (Operational Immunity) is constitutional, the specific technique (out-of-process) is an implementation detail. This prevents SDK authors from using other isolation techniques (e.g., WebAssembly sandboxing, separate threads with memory protection, language-level isolation) that might be more appropriate for their specific platform.

**Recommended fix**

Update Section 11.4 to mandate the *outcome* (Strict Operational Isolation) rather than the *technique* (out-of-process). For example: "Tier 1 Production Extensions SHALL utilize isolation mechanisms that guarantee no shared memory corruption and independent failure domains."

**Impact if ignored**

Loss of hardware and language neutrality. SDKs for embedded systems or high-performance environments may be unable to achieve Tier 1 certification despite having equivalent isolation guarantees.


---

### Finding 1.3 — Ambiguity of the term "Certification"

**Severity:** Medium

**Finding**

The introduction of "Performance Certification" (Section 21.5) creates an umbrella term "Certification" that conflicts with the usage of "Certification" throughout the rest of the document, which primarily refers to "Constitutional Certification".

**Evidence**

- **Section 17.2.11:** "Every SDK seeking **Constitutional Certification** SHALL be evaluated against identical constitutional requirements."
- **Section 21.5.3:** "**Certification** SHALL require successful completion of both: Constitutional Certification... and Performance Certification..."
- **Section 17.1:** "The purpose of **Certification** is to provide objective evidence..." (Does this include performance?)

**Why it matters**

Throughout the first 20 sections, "Certification" is used interchangeably with what is now called "Constitutional Certification". If "Certification" now requires performance validation, earlier sections describing the "Certification Model" may be incomplete or misleading if they don't account for the performance baseline.

**Recommended fix**

Perform a terminology normalization pass. Explicitly use "Constitutional Certification" when referring to behavioral compliance and "Full Certification" or "Zyppi Certification" when referring to the combined requirement in Section 21.5. Ensure Section 17.1 (Purpose) acknowledges both components if the umbrella term is used.

**Impact if ignored**

Legal and technical ambiguity regarding whether an SDK that passes behavioral tests but fails performance benchmarks is "Certified".


---

### Finding 1.4 — Runtime Authority vs Extension Isolation Bypass

**Severity:** High

**Finding**

Section 20.9 (and its duplicate 20.15) defines the SDK's reaction to isolation bypass attempts, potentially conflicting with the "Runtime is the Root of Trust" principle.

**Evidence**

- **Section 20.9:** "Attempts to bypass this isolation SHALL: 1. deactivate the Extension, 2. generate a constitutional observability event, 3. preserve the constitutional operation whenever possible."
- **Section 9.11:** "Only the Runtime determines: ... admission; ... attestation validity."

**Why it matters**

If an Extension attempts to bypass isolation, the SDK is taking an "admission" decision locally (deactivating the extension and deciding how to preserve the operation). If the bypass attempt involves credential theft or identity impersonation, the SDK is making a security decision that might belong to the Runtime or Policy engine.

**Recommended fix**

Clarify that the SDK's reaction to isolation bypass is an *enforcement* of local security policy, and that the "observability event" MUST be reported to the Runtime as a `COMPLIANCE_ERROR` or `SECURITY_EVENT` for final constitutional determination.

**Impact if ignored**

Potential for an compromised SDK to suppress isolation bypass events or handle them in a non-deterministic way.


---

# Pass 2 — Cross-Reference Integrity Audit

| Source | Reference | Status | Fix |
|---|---|---|---|
| Section 16.4.1 | Section 16.5 | Valid | N/A |
| Section 15.10 | Section 16.11 | **BROKEN** | Update to Section 16.11 (v2 renumbering artifact) |
| Section 15.12 | Section 16.13 | **BROKEN** | Update to Section 16.13 (v2 renumbering artifact) |
| Section 20.15.1 | Section 20.10 | Valid | N/A |
| Section 20.15.2 | Section 20.9 | Valid | N/A |
| Section 21.2.6 | Section 8.12 | Valid | N/A |
| Section 21.2.6 | Section 8.12 | Valid | N/A |
| Section 20.13 | §18.8 | **BROKEN** | Update to Section 20.8 (v2 renumbering artifact) |

---
# Pass 3 — Behavioral Completeness Audit

### Finding 3.1 — Undefined SDK Behavior for "Partial Admission"

**Severity:** High

**Finding**

The specification defines behavior for successful admission and rejected admission, but fails to define SDK requirements for "Partial Admission" of batch operations.

**Evidence**

- **Section 9.11 (Runtime Authority):** "Only the Runtime determines: execution success; admission; constitutional completion..."
- **Section 10.3 (Error Taxonomy):** Defines `RUNTIME_ERROR` and `COMPLIANCE_ERROR`, but doesn't specify batch-level semantics.

**Why it matters**

If a developer submits a batch of 10 Reality Claims and the Runtime admits 7 but rejects 3 due to policy, the SDK's behavioral contract is undefined. One SDK might throw an exception (all-or-nothing), while another might return a mixed-result object. This divergence breaks behavioral equivalence.

**Recommended fix**

Introduce a "Batch Operation Contract" in Section 8 (Behavioral Contract) that mandates: 1. SDKs MUST NOT simulate atomicity if the Runtime doesn't guarantee it. 2. Mixed results MUST be exposed as a collection of individual admission receipts/errors. 3. Partial failures MUST NOT throw a top-level exception unless no items were admitted.

**Impact if ignored**

Non-deterministic error handling in batch operations across different languages.


---

### Finding 3.2 — Missing SHALL for SDK Clock Drift

**Severity:** High

**Finding**

The specification defines "Time" as a ZRM primitive but lacks a mandatory behavioral contract for how SDKs handle local clock drift during Reality Claim creation.

**Evidence**

- **ZRM 7.1:** "Every future Zyppi capability must be expressible as: Nodes + Relationships + Facts + Time".
- **Section 13 (Offline Constitutional Contract):** Lacks requirements for timestamping offline events.

**Why it matters**

Reality Claims are bitemporal (valid time vs transaction time). If a mobile SDK uses a local clock that is 10 minutes fast to timestamp an Interaction, and the Runtime uses its own clock for the transaction timestamp, the "Reality" becomes inconsistent. Two certified SDKs might produce different "valid time" claims for the same event if one synchronizes clock and the other does not.

**Recommended fix**

In Section 13 (Offline Contract), add a requirement: "SDKs SHALL attempt to synchronize with Runtime-provided time anchors whenever connected. Offline timestamps SHALL be flagged with a 'client-reported' precision metadata to allow Runtime-side correction or policy evaluation."

**Impact if ignored**

Semantic ambiguity in the timeline of Reality Claims submitted from different devices.


---

### Finding 3.3 — Undefined Behavior for Extension Version Conflict

**Severity:** Medium

**Finding**

The specification defines Extension Identity and Compatibility Window (Section 20.13), but doesn't specify SDK behavior when two Extensions require conflicting versions of a shared dependency or the SDK itself.

**Evidence**

- **Section 20.13.1:** "An Extension SHALL explicitly declare the SDK versions it supports."
- **Section 20.15 (Runtime Enforcement):** Defines reaction to bypass attempts, but not to compatibility failures.

**Why it matters**

If Extension A requires SDK v2.1 and Extension B requires SDK v2.5, and the user is running SDK v2.2, the SDK's decision on which (if any) extensions to load is undefined.

**Recommended fix**

Add to Section 20.15: "SDKs SHALL NOT load Extensions whose Compatibility Window excludes the current SDK version. In the event of a dependency conflict between Extensions, the SDK SHALL prioritize constitutional stability and MAY refuse to load the conflicting Extensions, emitting a `COMPLIANCE_ERROR`."

**Impact if ignored**

Unpredictable SDK crashes or behavioral glitches when multiple Extensions are used.

# Pass 4 — Terminology Audit

### Finding 4.1 — Overloaded use of "Extension"

**Severity:** High

**Finding**

The term "Extension" is used to refer to both a software component (Batch 12) and a language-level extension (Batch 2), without clear distinction.

**Evidence**

- **Section 2.1:** Defines **Extension** as "A software component that extends SDK or Runtime behavior through approved interfaces."
- **Section 7 (SDK Design Philosophy):** Refers to "language-native extension reference" (Section 8.12) and "extension of a class" (Section 2.1 descriptive usage).
- **Section 20 (Batch 12):** Entirely about "Extensions" as pluggable modules.

**Why it matters**

When the specification says "Extensions SHALL be isolated" (Section 20.9), it is unclear if it refers to the architectural plugin or a developer-written subclass. If a developer "extends" a class in Java, they might assume they are subject to "Runtime Isolation" rules when they are actually part of the core SDK consumption.

**Recommended fix**

Reserve "Extension" (capitalized) strictly for the pluggable components defined in Batch 12. Use "Subclassing", "Inheritance", or "Language Extensions" for programming language concepts.

**Impact if ignored**

Technical misunderstanding of security boundaries.


---

### Finding 4.2 — Recursive definition of "SDK"

**Severity:** Medium

**Finding**

The definition of "SDK" in the Style Guide relies on the term itself, creating a circular reference.

**Evidence**

- **Section 2.1:** "**SDK**: Any official Zyppi Software Development Kit."

**Why it matters**

A constitutional definition should define the essence of the entity. Defining an SDK as an SDK is non-normative.

**Recommended fix**

Redefine SDK in Section 2.1 based on its functional role. For example: "**SDK**: The software interface layer that translates constitutional Zyppi capabilities into language-native developer experiences while preserving behavioral equivalence."

**Impact if ignored**

Weak formal foundation for the specification's most important term.


---

### Finding 4.3 — Ambiguous "Runtime" vs "Runtime Authority"

**Severity:** Medium

**Finding**

The specification uses "Runtime", "Runtime Authority", and "Runtime implementation" interchangeably in some sections, but distinguishes them in others.

**Evidence**

- **Section 9.11:** "Only the Runtime determines... admission."
- **Section 22.6.2:** "Community participation SHALL NOT require approval from the Runtime Authority."

**Why it matters**

"Runtime" usually refers to the software artifact. "Runtime Authority" suggests a governing body or a specific security role. If an SDK must check with the "Runtime Authority", it's unclear if that's an API call to a server or a legal request to Zyppi.

**Recommended fix**

Clarify that "Runtime" is the execution environment and "Runtime Authority" is the governance entity responsible for the Runtime.

**Impact if ignored**

Architectural confusion between software behavior and governance processes.

# Pass 5 — RFC 2119 Audit

### Finding 5.1 — Improper use of "MAY" in Non-Normative Segment

**Severity:** Medium

**Finding**

Section 23.1 (Non-goals) uses "MAY" which can be misinterpreted as a normative permission for a subject that is explicitly declared outside of scope.

**Evidence**

- **Section 23.1:** "These concerns MAY be governed by independent constitutional specifications or implementation-specific documentation."

**Why it matters**

"MAY" is a normative keyword (optional). Using it in a "Non-goals" section (which defines what the spec *doesn't* do) creates confusion. It suggests this specification is granting permission for other specs to exist, which is not its role.

**Recommended fix**

Use "might" or "are" (informative). For example: "These concerns are governed by independent specifications..."

**Impact if ignored**

Minor normative ambiguity.


---

### Finding 5.2 — Missing "MUST NOT" for Security Constraints

**Severity:** High

**Finding**

Several security requirements use "SHALL NOT" when "MUST NOT" (RFC 2119) would be more forceful and consistent with security industry standards.

**Evidence**

- **Section 15.4 (Credential Isolation):** "Extensions SHALL NOT access: internal session state..."
- **Section 8.5 (Side Effects):** "SDKs SHALL NEVER: fabricate constitutional outcomes..."

**Why it matters**

While "SHALL NOT" is valid, "MUST NOT" is the standard RFC 2119 keyword for absolute prohibitions, especially in security and interoperability contexts. Using "SHALL NEVER" is an editorial emphasis that is not a standard RFC 2119 keyword.

**Recommended fix**

Replace "SHALL NOT" and "SHALL NEVER" with "MUST NOT" in all sections defining security boundaries or data integrity prohibitions.

**Impact if ignored**

Non-standard normative language in critical security paths.


---

### Finding 5.3 — Weak "SHOULD" for Critical Observability

**Severity:** High

**Finding**

Section 8.12 uses "SHOULD" for exposing execution handles, which may allow SDKs to omit this critical feature.

**Evidence**

- **Section 8.12:** "For constitutional operations that cannot complete immediately, SDKs SHOULD expose a stable execution handle..."

**Why it matters**

If one SDK exposes handles and another doesn't, they are not behaviorally equivalent for asynchronous workflows. This should be a mandatory requirement to ensure consistent developer experience across languages.

**Recommended fix**

Upgrade "SHOULD" to "SHALL".

**Impact if ignored**

Divergent SDK capabilities for long-running operations.

# Pass 6 — Architecture Audit

### Finding 6.1 — Hidden Coupling between SDK and Certification Registry

**Severity:** High

**Finding**

The architecture assumes the SDK must interact with the Certification Registry at runtime for certain features (like Capability Discovery or Extension validation), but doesn't define the offline/cached behavior for this interaction.

**Evidence**

- **Section 20.13.1:** "Extensions whose maintenance lifecycle has ended SHALL be marked accordingly within the Certification Registry."
- **Section 20.15:** "Certification establishes that an Extension complies... at the time of certification. Certified SDKs SHALL additionally enforce that boundary during runtime."

**Why it matters**

If a Certified SDK is running in an air-gapped or offline environment, it cannot reach the Registry to verify if an Extension has been revoked or its lifecycle ended. This creates a hidden coupling to a remote service that contradicts the "Offline Constitutional Contract" (Section 13).

**Recommended fix**

Introduce a "Signed Attestation Model" for Extensions. Extensions should carry a cryptographically signed attestation from the Registry that the SDK can verify locally without a network connection. Define the "Attestation TTL" and cache-refresh requirements in Section 20.

**Impact if ignored**

Extensions may continue to run after revocation in offline/air-gapped environments, creating a security and compliance hole.


---

### Finding 6.2 — Potential for "Bloat" in Section 23 (Closure)

**Severity:** Medium

**Finding**

Section 23 (Closure) mixes constitutional closure, non-goals, and future relationships. This section is becoming a catch-all for anything that doesn't fit elsewhere.

**Evidence**

- **Section 23.1:** Lists "localization", "monitoring platforms", "CI/CD systems" as non-goals.
- **Section 23.3:** Lists relationships to AI-RPC, EVENT-SPEC, etc.
- **Section 23.5:** Declares closure.

**Why it matters**

Architectural "junk drawers" reduce the clarity of the specification's boundaries. Non-goals are usually part of the Introduction/Scope, while Closure is a lifecycle state.

**Recommended fix**

Move Section 23.1 (Non-goals) to Section 5 (Scope). Move Section 23.3 (Relationships) to Section 6 (Relationship to Other Specifications). Keep Section 23 strictly for Constitutional Stability and Closure.

**Impact if ignored**

Reduced specification navigability and logical grouping.


---

### Finding 6.3 — Extension state model lacks "Global State" definition

**Severity:** Medium

**Finding**

Section 20.12 (Extension State Model) prohibits Extensions from persisting "constitutional state" but doesn't define if multiple instances of the same Extension share state or if state is per-session.

**Evidence**

- **Section 20.12:** "Extensions MAY maintain state derived exclusively from their own execution."

**Why it matters**

If an Extension used for analytics is instantiated multiple times, it's unclear if the "Extension Identity" maps to a singleton or a per-call instance. Shared global state between extensions or instances can lead to side-channel attacks or data leakage that bypasses isolation.

**Recommended fix**

Define the "Extension Instance Lifecycle". Mandate that Extension state SHOULD be isolated per-session unless explicitly granted a "Global Perspective" capability class.

**Impact if ignored**

Potential side-channel data leakage between Extension executions.

# Pass 7 — Enterprise Adoption Audit

### Finding 7.1 — Lack of "Force Majeure" or Emergency Patching Policy

**Severity:** Medium

**Finding**

The "Breaking Change Policy" (Section 16.11) mandates 12 months for Tier 1 transitions but lacks an "Emergency Bypass" for critical security vulnerabilities that cannot be fixed without a breaking change.

**Evidence**

- **Section 16.11:** "Where a vulnerability cannot be mitigated without altering constitutional behavior, the resulting change SHALL follow the Breaking Change Policy... and SHALL NOT be introduced as a routine security update."

**Why it matters**

If a zero-day exploit is found in the way an SDK handles Reality Claims, and the fix requires changing an interface, an enterprise would be forced to choose between remaining vulnerable for 12 months or violating their own internal compliance by using an uncertified "emergency" patch.

**Recommended fix**

Introduce an "Emergency Constitutional Amendment" process. Allow for "Out-of-Band" breaking changes ONLY when verified by the AI Council as critical to ecosystem integrity, with a reduced mandatory migration window (e.g., 30 days) and dedicated migration assistance.

**Impact if ignored**

Protracted exposure to critical security risks due to rigid constitutional timelines.


---

### Finding 7.2 — Ambiguity in "Certified Ecosystem Model" (Federation)

**Severity:** Medium

**Finding**

The Federation model (Section 22.2.1) defines "Private Enterprise Registries" but doesn't specify if an SDK certified on a Private Registry is considered "Certified" by the Root Registry.

**Evidence**

- **Section 22.2.1:** "The Registry system SHALL support: ... Private enterprise registries."

**Why it matters**

If a Defense contractor runs a Sovereign Registry, they need to know if an SDK certified there is inter-compatible with one from the Public Registry. If "Certification" is not globally unique and cross-verifiable, the "Behavioral Equivalence" (Section 8.2) guarantee is weakened.

**Recommended fix**

Define "Certification Portability". State that Certification on a Delegated Registry MUST be cryptographically exportable and verifiable by any other Registry in the chain.

**Impact if ignored**

Fragmentation of the trust ecosystem where "Certified" has different meanings in different registries.


---

### Finding 7.3 — Missing SLA for Certification Registry Availability

**Severity:** Low

**Finding**

The specification mandates that SDKs verify certification (implicitly or explicitly), but doesn't define the availability requirements for the Root Registry.

**Evidence**

- **Section 17.15:** "The Registry SHALL provide a publicly verifiable source of Certification truth."

**Why it matters**

If an enterprise CI/CD pipeline depends on the Registry for deployment-time validation, a Registry outage becomes a deployment blocker. While Section 21.5 (Performance) says SDK-SPEC doesn't define SLAs, the Registry is a core *constitutional* artifact, not just an implementation detail.

**Recommended fix**

Define "Registry Reliability Principles" in Section 22.2. Mandate that the Root Registry SHALL be architected for high availability and SHALL support distributed mirroring to prevent single points of failure.

**Impact if ignored**

Operational risk for enterprise automation pipelines.

# Pass 8 — Editorial Audit

### Finding 8.1 — Excessive Repetition of "Batch 12" Headings

**Severity:** Low

**Finding**

The document contains 10 separate top-level headings for "SDK-SPEC-001 — Batch 12".

**Evidence**

- Lines 8102, 8739, 8999, 9232, 9416, 9768, 10047, 10269, 10465, 10589.

**Why it matters**

This makes the Table of Contents (if generated) extremely confusing and breaks the rhythm of the document. While Batch boundaries are important, they shouldn't supersede the logical section structure in a way that creates a dozen "Batch 12" markers.

**Recommended fix**

Consolidate Batch 12 content under a single "Batch 12" header or use a less obtrusive way to mark batch boundaries (e.g., a footer or a single marker at the start of Chapter 18).

**Impact if ignored**

Poor document navigation and visual clutter.


---

### Finding 8.2 — Inconsistent use of Horizontal Rules

**Severity:** Low

**Finding**

The document uses `---` horizontal rules inconsistently between Batches. Some Batches are separated by rules, others are not.

**Evidence**

- Rule exists before Batch 3 (line 806).
- No rule exists before Batch 5 (line 1618).

**Why it matters**

Inconsistent formatting makes the document feel like a collection of fragments rather than a unified specification.

**Recommended fix**

Standardize on using a horizontal rule before every `# SDK-SPEC-001 — Batch X` heading.

**Impact if ignored**

Reduced professional presentation.


---

### Finding 8.3 — Turgid prose in philosophical sections

**Severity:** Low

**Finding**

Some sentences in the "SDK Design Philosophy" (Section 7) remain overly long and academic.

**Evidence**

- **Section 7.11:** "When native language idioms and behavioral completeness conflict, behavioral completeness should take precedence." (This is good, but many surrounding sentences use heavy nominalization).

**Why it matters**

Philosophy should be inspiring and easy to grasp. Overly legalistic language in Informative sections can deter new developers.

**Recommended fix**

Perform a "Plain English" pass on Section 7. Use more direct verbs and fewer passive constructions.

**Impact if ignored**

Higher cognitive load for developers trying to understand the "why" behind the specification.
