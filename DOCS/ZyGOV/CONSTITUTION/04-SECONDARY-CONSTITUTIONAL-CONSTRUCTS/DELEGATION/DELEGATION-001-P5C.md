# DELEGATION-001-PH5-C — Agency Binding Contract
 
## Execution-Specific Actor ↔ Governed Subject Correspondence
 
  
 
Field
 
Determination
 
   
 
**Parent Constitution**
 
`DELEGATION-001 — Universal Delegation & Agency Constitution`
 
 
 
**Predecessors**
 
`PH5-A — Delegation Grant Relationship Contract`, `PH5-B — Delegation Parent & Lineage Contract`
 
 
 
**Phase**
 
`PH5-C`
 
 
 
**Classification**
 
SECONDARY CONSTITUTIONAL / EXECUTION-BINDING CONTRACT
 
 
 
**Primary Consumer**
 
ExecutionRequest V2 / RI
 
 
 
**Authoritative Delegation State**
 
POL + WS governed artifacts
 
 
 
**Implementation Authority**
 
**NONE**
 
 
 
**Repository Mutation Authority**
 
**NONE**
 
 
 
**New ZRM Primitive**
 
**NONE**
 
 
 
**New Persistent Agency Entity**
 
**NONE**
 
 
 
**New V2 Top-Level Partition**
 
**NONE**
 
 
 
**Status**
 
**OPEN — CONTRACT SYNTHESIS EXECUTED**
 
  
  
# 1. Governing Question
 
PH5-C asks:
 
 
**How does one execution bind an exact Actor to an exact Governed Subject through exact authoritative Delegation state without making the binding itself a new source of Authority, Trust, Permission or Reality?**
 
 
PH5-A answered:
 `What persistent constitutional artifact represents a direct Delegation Grant? ` 
PH5-B answered:
 `How does Delegated Authority derive through an exact constitutional lineage? ` 
PH5-C now answers:
 `How does THIS execution claim that:  Actor A      │      │ lawfully acts in relation to      ▼ Governed Subject B  using THIS exact Agency Basis? `  
# 2. REC-01C already requires Agency Binding
 
REC-01C established that:
 `Actor = Governed Subject ` 
is a lawful self-execution case.
 
But:
 `Actor ≠ Governed Subject ` 
requires explicit constitutional justification.
 
Its stress cases include employees, AI Agents, autonomous machines, direct B2B delegation, chained delegation and multi-party execution, and it expressly concludes that lawful delegated execution requires **explicit agency binding**.
 
REC-01C also rejects a fixed binary identity model because executions may involve:
 `Actor Governed Subject Authority Issuer Target Subject Target Object Beneficiary ` 
simultaneously.
 
Therefore PH5-C does not invent the need for Agency Binding.
 
It closes the contract already demanded by reconciliation.
  
# 3. REC-01G fixes the outer V2 boundary
 
REC-01G establishes the V2 partition:
 `ExecutionRequest V2 ├── contractVersion ├── requestId ├── participation ├── intent ├── requestedAction ├── constitutionalState ├── evidenceState ├── policyUniverse ├── evaluationContext └── executionContext ` 
and retires one overloaded root Identity as the universal execution role.
 
It further establishes:
 
 
A V2 execution with non-identical Actor and Governed Subject SHALL bind the constitutional state necessary to establish the claimed agency relationship.
 
 
Stage 5 may verify that the required basis is present and coherently bound, but it may not invent that basis.
 
Therefore:
 
# **PH5-C SHALL NOT CREATE AN ELEVENTH V2 TOP-LEVEL COMPONENT.**
 
Agency Binding must fit inside the accepted V2 grammar.
  
# 4. Constitutional definition — Agency Binding
 
An **Agency Binding** is:
 
 
**A derived execution-specific constitutional binding establishing that one exact Subject participating as `ACTOR` relies upon specified authoritative Agency state to act in relation to one exact Subject participating as `GOVERNED_SUBJECT` within one exact execution snapshot.**
 
 
Agency Binding answers:
 `WHO is acting?       + FOR WHICH GOVERNED SUBJECT?       + USING WHICH EXACT CONSTITUTIONAL AGENCY BASIS? ` 
It does not answer by itself:
 `Is the Action authorized? Is the Actor trusted? Does the Actor possess the requested Capability? Did the physical Action occur? `  
# 5. Agency Binding is not persistent constitutional Reality
 
Agency Binding exists because one execution requires a particular correspondence among already-existing constitutional facts.
 
It SHALL NOT become:
 `AgencyRecord PrincipalRecord RepresentationRecord ExecutionAuthorityRecord ` 
in the permanent Reality model.
 
Therefore:
 
# **PH5-C-01 — Derived Execution Construct**
 
 
Agency Binding SHALL be an execution-derived constitutional composition, not a new ZRM primitive, Registry Reality entity or permanent source of Authority.
 
  
# 6. Agency Binding does not create Authority
 
The Authority already exists through:
 `Origin Authority       ↓ Role Assignment or Delegation Grant       ↓ Delegated Authority ` 
PH5-B established that the lineage is derived from authoritative grant artifacts.
 
Agency Binding merely states:
 `this Actor       + this Governed Subject       + this exact authoritative basis       = the agency claim being relied upon for this execution ` 
Therefore:
 `Agency Binding       ≠ Authority `  
# 7. Agency Binding does not create Delegation
 
A caller cannot construct:
 `Actor = Alice Governed Subject = Acme Agency Binding = yes ` 
and thereby manufacture Delegation.
 
The binding is valid only where the referenced constitutional Agency Basis exists independently.
 
Thus:
 
# **DLG-C01 — No Binding-Created Delegation**
 
 
Agency Binding SHALL reference and compose existing authoritative Delegation state. It SHALL never create that state.
 
  
# 8. Agency Binding does not authorize the Action
 
REC-01D establishes:
 `Intent ≠ Requested Action ≠ Capability ` 
and makes Requested Action a separate first-class execution coordinate.
 
REC-01G preserves that separation.
 
Therefore:
 `valid Agency Binding         ≠ POL ALLOW ` 
The binding proves the claimed Actor↔Governed-Subject agency correspondence.
 
POL still evaluates the requested Action under the applicable constitutional state.
  
# 9. Agency Binding does not establish Trust
 
Likewise:
 `valid Agency Binding         ≠ SEC Trusted ` 
An Actor may possess valid Delegated Authority while failing a required security or Trust condition.
 
Conversely, a highly trusted Actor may possess no lawful Agency Basis for a particular Governed Subject.
 
Therefore:
 `Agency Authority Trust Authorization ` 
remain separate constitutional dimensions.
  
# 10. Agency Binding belongs semantically to Participation
 
The V2 `participation` component answers:
 
 
Which Subjects participate in this execution, and in which execution roles?
 
 
Agency Binding answers how two of those role-bound Subjects are constitutionally related **for this execution**.
 
Therefore the preferred semantic allocation is:
 `participation │ ├── Subject role bindings │ └── Agency Bindings ` 
while the authoritative source artifacts remain elsewhere:
 `constitutionalState │ ├── Authority ├── Role Assignment ├── Delegation Grant ├── Standing ├── Capability └── other governed state ` 
and proof material remains:
 `evidenceState ` 
This does **not** ratify a physical field literally named:
 `participation.agencyBindings ` 
It closes the responsibility boundary.
  
# 11. No duplicate Authority state inside Participation
 
Participation SHALL NOT duplicate:
 
 
- complete Delegation Grants;
 
- Role Assignments;
 
- Authority records;
 
- governing instruments;
 
- Evidence payloads;
 
- Attestation artifacts.
 

 
Instead, Agency Binding shall bind to their exact governed representation.
 
This maintains single ownership.
 
Conceptually:
 `PARTICIPATION Actor A Governed Subject B Agency Binding AB-1         │         │ references         ▼ CONSTITUTIONAL STATE Delegation basis D1 Authority lineage A0→D1→... `  
# 12. Atomic Agency Binding
 
The universal binding unit SHALL be atomic:
 `ONE Actor      ↕ ONE Governed Subject ` 
supported by one determinate Agency derivation basis.
 
Therefore one binding means:
 
 
Subject A, acting as ACTOR, relies on Agency Basis X to act in relation to Subject B, acting as GOVERNED_SUBJECT.
 
 
This avoids ambiguous many-to-many interpretation inside a single binding.
 
### DLG-C02 — Atomic Pairing
 
 
One Agency Binding SHALL bind exactly one `ACTOR` participant to exactly one `GOVERNED_SUBJECT` participant.
 
 
Multi-party execution uses multiple bindings.
  
# 13. Multiplicity
 
REC-01C expressly requires more than two participating Subjects.
 
Therefore one execution may contain:
 `0..N Agency Bindings ` 
Examples:
 `Actor A → Governed Subject B Actor A → Governed Subject C ` 
or:
 `Actor A → Governed Subject C Actor B → Governed Subject C ` 
represented as separate atomic bindings.
 
### DLG-C03 — Binding Multiplicity
 
 
Execution SHALL support zero or more Agency Bindings and SHALL NOT assume one universal Actor/Principal pair.
 
  
# 14. Zero bindings is a valid state
 
For self-execution:
 `Actor = Governed Subject ` 
REC-01C requires no synthetic Delegation.
 
Therefore:
 `Agency Bindings = 0 ` 
may be perfectly valid.
 
Examples:
 `Alice acts for Alice ` 
or:
 `Organization's own constitutional execution identity acts under Organization Authority ` 
where no separate agency relation exists.
  
# 15. Self-execution must not create ceremonial Agency Binding
 
This is prohibited:
 `Actor = Alice Governed Subject = Alice Agency Binding: Alice acts for Alice ` 
merely because the schema supports Agency Binding.
 
### DLG-C04 — Zero-Agency Self-Execution
 
 
Where Actor and Governed Subject are the same Subject and no separate agency relation is constitutionally required, Agency Binding SHALL be absent.
 
 
Delegated origin of an Authority held by Alice does not alter this rule.
 
Alice may exercise Authority that was historically delegated **to Alice** while still executing as:
 `Actor = Alice Governed Subject = Alice ` 
That Authority lineage belongs to constitutional state.
 
It does not create an Actor→Alice agency relationship.
  
# 16. Actor ≠ Governed Subject requires Agency Binding
 
This is the central PH5-C law.
 
If:
 `Actor A ≠ Governed Subject B ` 
and the execution claims A is acting in relation to B's governed state:
 `Agency Binding A→B ` 
is mandatory.
 
No binding means:
 `INCOMPLETE DELEGATED EXECUTION ` 
not:
 `assume employment assume ownership assume service relationship assume API authority ` 
### DLG-C05 — Mandatory Cross-Subject Binding
 
 
Every execution-dependent `ACTOR ≠ GOVERNED_SUBJECT` correspondence SHALL possess an explicit Agency Binding.
 
  
# 17. Both endpoints must already exist in Participation
 
Agency Binding may not introduce hidden Subjects.
 
For every binding:
 `Actor participant reference ` 
must resolve to a Subject already bound to:
 `ACTOR ` 
and:
 `Governed Subject participant reference ` 
must resolve to a Subject already bound to:
 `GOVERNED_SUBJECT ` 
### DLG-C06 — No Hidden Participants
 
 
Agency Binding SHALL NOT introduce a Subject absent from the execution's explicit Participation state.
 
  
# 18. Role mismatch fails
 
If:
 `Subject Alice ` 
exists in Participation only as:
 `BENEFICIARY ` 
but an Agency Binding refers to Alice as its Actor endpoint, the binding is incoherent.
 
Likewise a Subject bound only as Target cannot silently become Governed Subject.
 
Role correspondence must be exact.
  
# 19. Binding endpoint identity must be exact
 
This is prohibited:
 `Actor = any employee of Acme ` 
or:
 `Actor = current service provider ` 
or:
 `Governed Subject = organization matching authority scope ` 
A binding must identify exact constitutional Subjects.
 
No current/latest lookup may substitute for an explicit Subject identity.
  
# 20. UNKNOWN Actor remains representable—but not as a proven delegate
 
REC-01G requires epistemic incompleteness to remain representable and prohibits fabrication of Actor Identity. An unauthenticated public interaction may truthfully represent an unknown Actor.
 
However a lawful Delegation Grant identifies its Delegate.
 
Therefore:
 `Actor = UNKNOWN ` 
cannot be matched to an exact Delegate in a claimed Agency Basis.
 
Thus:
 
# **DLG-C07 — Unknown Is Not a Delegated Identity**
 
 
`UNKNOWN` Actor MAY remain representable in Participation, but SHALL NOT satisfy an Agency Binding requiring an identified Delegate.
 
 
Where authentication/identity is required:
 `UNKNOWN     ↓ missing required constitutional fact     ↓ INDETERMINATE / FAIL CLOSED ` 
according to the governing Policy/Security rules.
 
Unknown shall never be replaced with a fabricated Actor merely to make Agency Binding pass.
  
# 21. Agency Basis must be exact
 
An Agency Binding SHALL identify the exact terminal constitutional basis upon which the Actor relies.
 
That basis may be:
 `ROLE-BASED:   Role Assignment  DIRECT:   Delegation Grant ` 
as closed by PH5-A.
 
It SHALL NOT use:
 `"some valid delegation" "latest authority" "matching relationship" "current role" `  
# 22. Terminal Delegate must equal Actor
 
Suppose:
 `Delegation Grant: Acme → Alice ` 
but:
 `Agency Binding: Actor = Bob Governed Subject = Acme Basis = Acme→Alice grant ` 
This must fail.
 
### DLG-C08 — Delegate/Actor Correspondence
 
 
The final Delegate/Authority holder established by the bound Agency Basis SHALL correspond exactly to the Actor participant claimed by the Agency Binding.
 
 
No Actor substitution is permitted.
  
# 23. Role Assignment Actor must equal Actor
 
For role-based Agency:
 `Role Assignment actor = Alice ` 
must correspond exactly to:
 `Agency Binding Actor = Alice ` 
A valid Role Assignment belonging to another Subject cannot be reused.
  
# 24. Complete lineage must be available
 
PH5-B establishes that every delegated Authority derives through an exact, acyclic, origin-terminating lineage.
 
Therefore Agency Binding cannot rely only upon a terminal grant where the complete required parent state is absent.
 
Conceptually:
 `Agency Binding       ↓ Terminal basis D3       ↓ D2       ↓ D1       ↓ Authority Origin ` 
must be deterministically resolvable from the execution-bound constitutional state.
 
### DLG-C09 — Lineage Closure
 
 
A delegated Agency Binding SHALL fail closed when any constitutionally required parent Authority basis is missing or unresolved.
 
  
# 25. Agency Binding does not make Lineage authoritative
 
The binding may identify:
 `terminal Agency Basis ` 
and may bind an exact derived lineage representation for verification efficiency.
 
But PH5-B remains controlling:
 `Delegation Lineage = derived non-authoritative ` 
The authoritative truth remains the individual governed Authority/Delegation artifacts.
  
# 26. Governed Subject correspondence must be explicit
 
This closes the most important remaining semantic gap.
 
A Delegation Grant says:
 `Delegator A delegates Authority to Delegate B ` 
That does not automatically mean every future execution by B is:
 `for A ` 
nor that A is always the Governed Subject.
 
Likewise a Role Assignment's organizational scope cannot automatically be interpreted as:
 `GOVERNED_SUBJECT = that organization ` 
Therefore Agency Binding requires explicit constitutional support for:
 `this Agency Basis authorizes Actor A to act in relation to Governed Subject B ` 
### DLG-C10 — Explicit Governed-Subject Correspondence
 
 
The Agency Basis or other exact governed constitutional state bound to the execution SHALL establish the claimed correspondence between the Actor and the specific Governed Subject.
 
  
# 27. What may establish Governed Subject correspondence
 
Depending upon the lawful agency form, correspondence may be established through governed material such as:
 
 
- the governing instrument;
 
- explicit Authority scope;
 
- Role Assignment + Authority Anchor semantics;
 
- Delegation Grant source material;
 
- another governed Agency/Authority relation;
 
- a future constitutional composition explicitly authorized for that purpose.
 

 
PH5-C does not require all correspondence to use one physical field.
 
It requires the correspondence to be **constitutionally explicit**.
  
# 28. What does not establish Governed Subject correspondence
 
The following alone are insufficient:
 `same tenant same organization name employment ownership contract title Role Type shared Evidence shared Registry namespace business convention SDK route API credential Profile mapping ` 
unless a governing constitutional rule explicitly makes that fact sufficient.
 
### DLG-C11 — No Contextual Inference
 
 
Execution infrastructure SHALL NOT infer Governed Subject correspondence from contextual proximity.
 
  
# 29. Delegator and Governed Subject may differ
 
This is intentionally supported.
 
Example:
 `Regulator C      ↓ grants Authority Inspector A ` 
for an execution concerning:
 `Governed Subject B ` 
The Authority Issuer is C.
 
The Actor is A.
 
The Governed Subject is B.
 
Therefore PH5-C SHALL NOT impose:
 `Delegator = Governed Subject ` 
as universal law.
  
# 30. Governed Subject may not equal Authority Issuer
 
Likewise:
 `Authority Issuer ≠ Governed Subject ` 
is lawful where the governing constitution supports it.
 
This is why Agency Binding must be based on explicit constitutional correspondence rather than endpoint equality shortcuts.
  
# 31. Multiple Governed Subjects
 
A single Actor may lawfully participate in one execution where multiple Subjects' constitutional states materially govern the action.
 
Example:
 `Actor: Logistics Provider  Governed Subject 1: Manufacturer  Governed Subject 2: Importer ` 
If both require separate agency bases:
 `Binding 1: Actor → Manufacturer  Binding 2: Actor → Importer ` 
shall be represented independently.
 
One vague:
 `Actor acts for both ` 
binding is insufficient.
  
# 32. Multiple Actors
 
A single Governed Subject may also depend upon multiple acting Subjects.
 
Example:
 `Actor 1: Human Approver Actor 2: AI Agent Governed Subject: Company ` 
PH5-C permits:
 `Binding A: Human → Company  Binding B: AI Agent → Company ` 
if both are constitutionally material to the execution.
 
Whether their Authority is jointly required is a separate constitutional composition question.
 
Agency Binding SHALL NOT invent joint Authority merely from co-presence.
  
# 33. Multiple Agency Bases for the same pair
 
An Actor may possess multiple lawful grants relating to one Governed Subject.
 
However Agency Binding SHALL NOT say:
 `use whichever one works ` 
The execution must bind the exact basis relied upon.
 
If multiple independent bases are jointly required, their composition must itself be governed.
 
### DLG-C12 — Exact Basis Selection
 
 
Agency Binding SHALL identify the exact constitutional Agency Basis relied upon and SHALL NOT authorize opportunistic selection among available grants.
 
  
# 34. Authority union is prohibited by default
 
Suppose:
 `Grant D1: READ  Grant D2: WRITE ` 
The existence of both does not automatically mean a binding may manufacture:
 `READ + WRITE ` 
unless the governing Authority model lawfully composes them.
 
PH5-C SHALL NOT perform Authority union.
 
That remains POL/governing-constitution territory.
  
# 35. Requested Action is not duplicated inside Agency Binding
 
REC-01G already provides:
 `requestedAction ` 
as a separate V2 component.
 
Therefore Agency Binding SHALL NOT create another:
 `agencyAction ` 
field merely to repeat it.
 
Instead:
 
 
The Agency Binding SHALL participate in the same whole execution snapshot as the exact Requested Action.
 
 
Thus Action substitution creates a different execution identity and requires revalidation of Agency compatibility.
  
# 36. Action scope remains relevant
 
Although Agency Binding does not own Requested Action, the underlying Delegation/Authority may be Action-bounded.
 
Therefore execution coherence must be able to answer:
 `Does the claimed Agency Basis cover the exact Requested Action? ` 
PH5-C assigns the separation:
 `Requested Action identity: REC / V2  Authority scope: POL / governing Authority state  Agency correspondence: DELEGATION-001  substantive permission: POL ` 
Stage 5 may check the required bindings are coherent.
 
It SHALL NOT independently create Permission.
  
# 37. Target is not duplicated either
 
The exact Target belongs to Requested Action.
 
Agency Binding SHALL NOT create a second target ontology.
 
But where Authority is Target-bounded:
 `Target substitution ` 
changes whether the Agency Basis applies.
 
REC-01E already requires Target substitution to create a different bound execution state.
 
Thus Agency Binding is inseparable from the exact whole-request snapshot.
  
# 38. Requested Capability remains separate
 
Likewise:
 `Capability ≠ Delegation ` 
and the requested Capability remains a claim under the Requested Action contract.
 
Agency Binding must not transform:
 `requested Capability ` 
into proof of delegated Authority.
 
The underlying constitutional state determines whether the Actor possesses the required Authority/Capability.
  
# 39. Intent originator is not inferred from Agency Binding
 
REC-01G explicitly requires the Intent originator to be carried independently and permits it to be:
 
 
- Actor;
 
- Governed Subject;
 
- another lawful Subject where permitted.
 

 
Therefore:
 `Agency Binding Actor = Alice ` 
does not establish:
 `Intent originator = Alice ` 
Similarly:
 `Governed Subject = Acme ` 
does not force:
 `Intent originator = Acme ` 
### DLG-C13 — Intent Independence
 
 
Agency Binding SHALL NOT infer or overwrite Intent originator.
 
  
# 40. Agency Binding is snapshot-bound
 
REC-01E establishes that individually valid constitutional inputs do not establish a valid execution unless they belong to one coherent execution state.
 
Its adversarial matrix explicitly rejects:
 
 
- Actor state from another snapshot;
 
- Governed Subject state from another snapshot;
 
- Delegation basis outside bound temporal state;
 
- Requested Action substitution;
 
- Target substitution.
 

 
Therefore:
 
# **DLG-C14 — Agency Snapshot Binding**
 
 
Every Agency Binding and every authoritative constitutional artifact upon which it depends SHALL belong to the exact execution snapshot being evaluated.
 
  
# 41. No post-binding grant substitution
 
Suppose:
 `snapshot binds D1 ` 
then before execution:
 `D1 replaced by D2 ` 
The system cannot silently use D2.
 
Even if D2 is newer or broader.
 
The execution must be rebound as a new snapshot.
 
This inherits REC-01E's:
 `no latest no silent upgrade ` 
law.
  
# 42. Agency Binding has one execution-effective temporal coordinate
 
The agency claim must be evaluated against the relevant explicit execution-effective temporal state, including:
 `T_e_input ` 
where applicable.
 
The binding cannot rely upon:
 `Date.now() current Registry time latest grant ` 
inside Runtime.
 
PH5-C does not decide which upstream authority establishes current revocation validity.
 
That remains `CLOSURE-02`.
 
It does establish:
 
 
The temporal state used by Agency Binding must be explicit and bound.
 
  
# 43. Stale agency state fails current execution
 
If:
 `Delegation valid T1 revoked T2 execution T3 ` 
a snapshot containing only the old T1 grant cannot establish current agency at T3 merely because the grant was once valid.
 
Current execution must fail unless current authoritative state establishes validity.
 
Historical replay remains different.
  
# 44. Historical Agency Binding
 
For historical reconstruction at T1:
 `Actor A Governed Subject B Agency Basis D1 ` 
may remain exactly valid even if D1 is revoked today.
 
Therefore:
 `Historical Agency Binding ` 
means:
 
 
this Actor↔Governed-Subject correspondence was constitutionally established under the exact historical snapshot.
 
 
It does not mean:
 
 
the same relationship authorizes new execution now.
 
  
# 45. Historical bindings shall not be upgraded
 
A historical V1 execution that never represented Agency Binding cannot be retroactively assigned one merely because V2 now has the concept.
 
REC-01G prohibits automatic V1→V2 semantic upgrade.
 
Therefore:
 
# **DLG-C15 — Contract-Generation Historical Fidelity**
 
 
Historical execution SHALL NOT manufacture Agency Binding semantics absent from the original contract generation unless independently governed historical material establishes those facts outside the original request.
 
  
# 46. Proof material remains independently owned
 
Phase 4 established:
 `Delegation Chain ≠ Attestation Chain ` 
and Attestation proves constitutional compliance without creating Authority.
 
Therefore Agency Binding may bind exact proof/attestation references where required, but it SHALL NOT inline or redefine SEC/RSN proof semantics.
 
Conceptually:
 `Agency Binding       │       ├── exact Agency Basis       └── exact required proof refs               │               ▼          evidenceState /          attestation state `  
# 47. Missing required proof makes the binding incomplete
 
Where SEC or another governing constitution requires proof of:
 
 
- Actor Identity;
 
- Role Assignment integrity;
 
- Delegation Grant validity;
 
- parent lineage;
 
- non-revocation;
 
- technical Subject attestation;
 

 
and the required material is absent:
 `Agency Binding     = INCOMPLETE ` 
The binding shall not treat absence as positive proof.
  
# 48. Extra proof cannot strengthen Authority
 
An execution may contain additional valid Evidence or Attestations.
 
Those materials cannot enlarge the scope of the Agency Basis.
 
Thus:
 `stronger proof ≠ broader Authority ` 
and:
 `more Evidence ≠ more Delegation `  
# 49. Agency Binding does not own Standing
 
REC-01C explicitly notes that Actor Standing and Governed Subject Standing may differ and both may matter.
 
Therefore Agency Binding SHALL NOT compress:
 `Actor standing Governed Subject standing ` 
into one:
 `agency valid ` 
flag.
 
Standing remains in constitutional state and is evaluated according to its owner.
  
# 50. Agency Binding does not own Authority status
 
Likewise the binding may point to:
 `Authority state ` 
but it does not own whether that Authority is currently constitutionally valid.
 
A perfectly well-formed Agency Binding may resolve to:
 `Authority revoked ` 
and therefore fail execution.
 
This distinction is intentional.
  
# 51. Agency Binding has no independent lifecycle
 
A persistent Delegation Grant has lifecycle.
 
A Role Assignment has lifecycle.
 
Authority has lifecycle.
 
Agency Binding is execution-specific.
 
Therefore it SHALL NOT acquire independent Registry lifecycle states such as:
 `ACTIVE SUSPENDED REVOKED ` 
A new execution simply binds the relevant current/historical source state.
 
### DLG-C16 — No Agency-Binding Lifecycle
 
 
Agency Binding SHALL not possess an independent constitutional lifecycle separate from its execution snapshot.
 
  
# 52. Agency Binding has no Registry identity requirement
 
Because Agency Binding is execution-derived, PH5-C does not require:
 `agency_binding_id ` 
as a globally persistent constitutional Identity.
 
If a physical V2 contract later requires a local stable reference for canonicalization, diagnostics or receipts, that identifier is an **execution-contract detail**, not a new Reality/Registry identity.
  
# 53. Agency Binding participates in whole-request identity
 
REC-01E requires Action, Target, Participants and constitutional state to be part of one bound execution identity.
 
Therefore changing any of the following:
 `Actor Governed Subject Agency Basis required lineage ` 
must change the constitutional execution snapshot.
 
A binding cannot be swapped while retaining the same whole-request identity.
  
# 54. Actor substitution
 
Given:
 `Binding: Alice → Acme Basis: D1 terminating at Alice ` 
substitution to:
 `Bob → Acme ` 
while keeping D1 is:
 `REJECT ` 
The basis no longer terminates at the Actor.
  
# 55. Governed Subject substitution
 
Given:
 `Binding: Alice → Acme ` 
substitution to:
 `Alice → Beta Corp ` 
without constitutional basis explicitly establishing Beta correspondence is:
 `REJECT ` 
Even if Alice holds valid Authority for Acme.
  
# 56. Agency basis substitution
 
Given:
 `Binding: Alice → Acme Basis D1 ` 
replacing D1 with:
 `D2 ` 
after snapshot binding requires a new snapshot.
 
The caller may not choose another grant merely because D1 fails.
  
# 57. Missing binding is not self-execution
 
This is critical.
 
If:
 `Actor = Alice Governed Subject = Acme ` 
and no Agency Binding is supplied, the Runtime must **not** reinterpret the request as:
 `Actor = Acme ` 
or:
 `Alice = Acme ` 
or:
 `self-execution ` 
The request is incomplete.
 
### DLG-C17 — No Collapse-to-Self
 
 
Missing Agency Binding SHALL NOT be repaired by collapsing Actor and Governed Subject identities.
 
  
# 58. Extra Agency Binding is constitutionally material
 
An unexpected binding cannot simply be ignored.
 
Example:
 `Expected: Alice → Acme  Supplied: Alice → Acme Alice → Beta ` 
The second binding changes participation/agency semantics.
 
Because execution-affecting state must be exact, an unrequired or unauthorized extra binding is constitutionally material.
 
Whether it results in outright rejection or must be proven irrelevant belongs to the governing execution contract.
 
Default:
 `unexpected execution-affecting binding     → new/different snapshot `  
# 59. Domain Profiles may not invent Agency Binding
 
Z-PROF/domain APIs may map friendly vocabulary into an already-governed execution coordinate.
 
They SHALL NOT decide:
 `employee therefore acts for company AI API key therefore acts for customer 3PL therefore acts for manufacturer ` 
unless exact governed source material establishes that fact.
 
Agency Binding must be constructed from explicit constitutional state.
  
# 60. SDK/MCP caller claims are not Authority
 
A caller may request:
 `actFor = "Acme" ` 
for developer ergonomics.
 
That value is merely a claim/input until constitutional composition resolves an exact Governed Subject and exact Agency Basis.
 
No API convenience parameter becomes constitutional agency truth.
  
# 61. Application responsibility
 
Application may lawfully:
 
 
- retrieve exact Delegation Grants;
 
- retrieve Role Assignments;
 
- retrieve governing instruments;
 
- resolve exact parent lineage;
 
- retrieve required proof state;
 
- compose exact Participation;
 
- construct the Agency Binding.
 

 
But:
 `Application composition ≠ Authority creation ` 
Application must not invent missing correspondence.
  
# 62. RI responsibility
 
RI receives the already-bound state.
 
It may perform constitutionally assigned structural/coherence checks such as:
 `Actor exists Governed Subject exists binding endpoints match participation Agency Basis is present terminal Delegate matches Actor required lineage state is bound required temporal coordinate exists ` 
RI shall not:
 
 
- find a different Delegation;
 
- infer represented organization;
 
- choose a stronger grant;
 
- acquire missing parents;
 
- repair expired state;
 
- assign Trust;
 
- create Permission.
 

  
# 63. Stage-5 compatibility boundary
 
REC-01G's future Stage 5 is an **Execution Envelope Compatibility** stage.
 
For Agency Binding, Stage 5 may eventually establish:
 `Participation structurally coherent + required Agency Binding present + Binding endpoints correspond + required Agency Basis present + bound lineage structurally complete + Action/Target/Capability coordinates present + temporal coordinates present + snapshot references coherent ` 
It does **not** establish:
 `POL Authorization SEC Trust Reality occurrence ` 
This distinction is permanent.
  
# 64. Candidate semantic structure
 
Without ratifying field names, Agency Binding must be capable of expressing:
 `AGENCY BINDING │ ├── Actor participant reference │ ├── Governed Subject participant reference │ ├── Agency Basis reference │      ├── Role Assignment │      └── Direct Delegation Grant │ ├── required lineage binding │ ├── governed-subject correspondence basis │ └── proof references where required ` 
Temporal, Action and Target identity may be supplied through the enclosing execution snapshot rather than duplicated.
 
This is a semantic contract.
 
It is not a TypeScript interface.
  
# 65. Agency Basis type must be explicit
 
A generic:
 `agencyBasisId: string ` 
is insufficient if the consumer cannot determine which constitutional contract governs the reference.
 
The future physical reference must distinguish at least semantically between:
 `ROLE_ASSIGNMENT DIRECT_DELEGATION_GRANT ` 
without introducing Runtime domain inference.
 
The exact discriminated reference schema belongs to V2 leaf-contract construction.
  
# 66. No `Record<string, unknown>`
 
Agency Binding SHALL NOT contain:
 `metadata params context agencyDetails ` 
as untyped escape hatches for constitutional meaning.
 
Every execution-affecting coordinate must have governed semantics.
 
This follows the same constitutional discipline established for Requested Action.
  
# 67. Candidate cardinality rules
 
Semantically:
 `Execution     has 0..N Agency Bindings  Agency Binding     has exactly 1 Actor  Agency Binding     has exactly 1 Governed Subject  Agency Binding     has exactly 1 determinate terminal Agency Basis ` 
The Agency Basis may itself derive through a multi-hop lineage.
 
This atomicity removes ambiguity without limiting multi-party execution.
  
# 68. Direct and role-based bindings are operationally equivalent at the PH5-C boundary
 
Once the authoritative basis has been identified:
 `Role Assignment ` 
or:
 `Delegation Grant ` 
the Agency Binding does not create separate Runtime semantics for each.
 
Both answer:
 
 
Which governed Agency Basis establishes the Actor's claimed relation to the Governed Subject?
 
 
RI should not contain:
 `if employee... if AI... if B2B... ` 
The constitutional artifact kind is explicit, but the execution law remains universal.
  
# 69. Mixed lineage remains supported
 
PH5-B permits:
 `Role Assignment       ↓ Direct Delegation Grant       ↓ Role Assignment ` 
where lawfully governed.
 
Agency Binding need only terminate at the exact final Agency Basis relied upon and bind the complete required derivation state.
 
It does not require one physical grant family throughout the chain.
  
# 70. Receipt/provenance direction
 
REC-01E requires eventual receipts to prove which execution snapshot produced an outcome, including participants and constitutional state.
 
Therefore future receipt provenance must be capable of tracing:
 `Execution       ↓ Participation       ↓ Agency Binding       ↓ Agency Basis       ↓ Delegation Lineage ` 
This does not authorize receipt fields yet.
 
It establishes the provenance requirement.
  
# 71. PH5-C adversarial scenarios
 
## C-SIM-01 — Self-execution
 `Actor = Alice Governed Subject = Alice Agency Binding = none ` 
**PASS**
 
provided the remaining constitutional requirements pass.
  
## C-SIM-02 — Employee for corporation
 `Actor = Alice Governed Subject = Acme Basis = Alice's valid Role Assignment Correspondence = exact governing instrument ` 
**PASS CANDIDATE**
 
subject to Authority, Standing, SEC and POL evaluation.
  
## C-SIM-03 — Missing agency
 `Actor = Alice Governed Subject = Acme Agency Binding = none ` 
**REJECT / INCOMPLETE EXECUTION**
  
## C-SIM-04 — Wrong Actor
 `Basis terminates at Alice Actor = Bob Governed Subject = Acme ` 
**REJECT**
  
## C-SIM-05 — Wrong Governed Subject
 `Basis supports Alice acting for Acme Binding says Alice → Beta ` 
**REJECT**
  
## C-SIM-06 — AI Agent
 `Actor = AI Agent A Governed Subject = Acme Basis = valid chained delegation SEC proof = required and present ` 
**PASS CANDIDATE**
 
No AI-specific Agency ontology required.
  
## C-SIM-07 — Unknown Actor in public verification
 `Actor = UNKNOWN Governed Subject = none Agency Binding = none ` 
**REPRESENTABLE**
 
Policy decides whether unidentified Actor is sufficient.
  
## C-SIM-08 — Unknown delegated Actor
 `Actor = UNKNOWN Governed Subject = Acme Basis terminates at AI Agent A ` 
**REJECT / INDETERMINATE**
 
The delegate cannot be matched to the Actor.
  
## C-SIM-09 — Two governed subjects
 `Actor = Logistics Co  Binding 1: Logistics Co → Manufacturer  Binding 2: Logistics Co → Importer ` 
**REPRESENTABLE**
 
provided both bindings are independently justified.
  
## C-SIM-10 — Actor substitution after binding
 `Snapshot: Alice → Acme  Mutation: Bob → Acme ` 
without new Agency Basis.
 
**REJECT**
  
## C-SIM-11 — Action substitution
 `same Agency Binding Action: quote → binding purchase ` 
without rebuilding the execution snapshot.
 
**REJECT**
 
Action substitution changes execution identity.
  
## C-SIM-12 — Target substitution
 `same Binding Target: Shipment X → Shipment Y ` 
where Authority is Target-bounded.
 
**REJECT**
  
## C-SIM-13 — Revoked parent
 `Binding points to D3 D3 lineage includes D1 D1 revoked before T_e_input ` 
**REJECT CURRENT EXECUTION**
 
Historical replay remains separately possible.
  
## C-SIM-14 — Silent grant fallback
 `D1 invalid Application silently selects D9 ` 
**REJECT**
 
New bound execution required.
  
## C-SIM-15 — Fake Governed Subject from employer metadata
 `Role Assignment says: Actor = Alice organization metadata = Acme  Application assumes: Governed Subject = Acme ` 
without an explicit constitutional correspondence basis.
 
**REJECT**
  
## C-SIM-16 — Authority Issuer differs from Governed Subject
 `Regulator C       ↓ authority Inspector Alice  Actor = Alice Governed Subject = Facility Operator B ` 
**REPRESENTABLE**
 
No equality between Delegator/Issuer and Governed Subject is required.
  
# 72. PH5-C invariants
 
### `DLG-C01 — No Binding-Created Delegation`
 
Agency Binding SHALL never create Delegation or Authority.
 
### `DLG-C02 — Atomic Pairing`
 
Each Agency Binding SHALL bind exactly one Actor to exactly one Governed Subject.
 
### `DLG-C03 — Binding Multiplicity`
 
An execution MAY contain zero or more Agency Bindings.
 
### `DLG-C04 — Zero-Agency Self-Execution`
 
Self-execution SHALL not require synthetic Agency Binding.
 
### `DLG-C05 — Mandatory Cross-Subject Binding`
 
Actor ≠ Governed Subject SHALL require explicit Agency Binding where agency is constitutionally claimed.
 
### `DLG-C06 — No Hidden Participants`
 
Every Agency Binding endpoint SHALL resolve to an explicit Participation entry.
 
### `DLG-C07 — Unknown Is Not a Delegated Identity`
 
Unknown Actor SHALL not satisfy a Delegation whose terminal Delegate is an identified Subject.
 
### `DLG-C08 — Delegate/Actor Correspondence`
 
The terminal Agency Basis holder SHALL correspond exactly to the bound Actor.
 
### `DLG-C09 — Lineage Closure`
 
All required Authority lineage SHALL be bound and reconstructable.
 
### `DLG-C10 — Explicit Governed-Subject Correspondence`
 
The claimed Actor↔Governed-Subject relation SHALL be constitutionally established, not inferred.
 
### `DLG-C11 — No Contextual Inference`
 
Tenant, employer, contract title, Role Type or business convention SHALL NOT manufacture Governed Subject correspondence.
 
### `DLG-C12 — Exact Basis Selection`
 
The exact Agency Basis relied upon SHALL be explicit.
 
### `DLG-C13 — Intent Independence`
 
Agency Binding SHALL NOT infer Intent originator.
 
### `DLG-C14 — Agency Snapshot Binding`
 
Agency Binding and all required source state SHALL belong to the exact execution snapshot.
 
### `DLG-C15 — Contract-Generation Historical Fidelity`
 
Historical executions SHALL not acquire Agency Binding semantics absent from their original contract generation or independent historical proof.
 
### `DLG-C16 — No Agency-Binding Lifecycle`
 
Agency Binding SHALL not become an independently lifecycle-managed Registry entity.
 
### `DLG-C17 — No Collapse-to-Self`
 
Missing Agency Binding SHALL NOT be repaired by equating Actor and Governed Subject.
 
### `DLG-C18 — No Authorization Promotion`
 
A valid Agency Binding SHALL NOT itself constitute POL Authorization.
 
### `DLG-C19 — No Trust Promotion`
 
A valid Agency Binding SHALL NOT itself establish SEC Trust.
 
### `DLG-C20 — Whole-Execution Identity`
 
Changing Actor, Governed Subject, Agency Basis or required lineage SHALL change the bound execution state.
  
# 73. What PH5-C closes
 
Before PH5-C:
 `DLG-GAP-04 V2 Agency Binding Contract     OPEN ` 
After PH5-C:
 `DLG-GAP-04 SEMANTIC CONTRACT:     CLOSED ` 
Closed questions include:
 
 
- what Agency Binding is;
 
- where it belongs constitutionally;
 
- what it does not own;
 
- Actor/Governed-Subject atomicity;
 
- multiplicity;
 
- self-execution;
 
- explicit cross-subject requirement;
 
- exact Agency Basis;
 
- terminal Delegate matching;
 
- lineage closure;
 
- Governed Subject correspondence;
 
- unknown Actor handling;
 
- Action/Target snapshot coupling;
 
- temporal binding;
 
- historical behavior;
 
- proof separation;
 
- Application/RI responsibility.
 

  
# 74. Physical details intentionally deferred
 
PH5-C does **not** yet ratify:
 `interface AgencyBinding agencyBindingId actorParticipantId governedSubjectParticipantId agencyBasisKind agencyBasisId lineageRef proofRefs ` 
nor:
 `participation.agencyBindings[] ` 
as literal TypeScript.
 
Those belong to the V2 leaf-contract/implementation-design phase.
 
The constitutional responsibilities are now closed sufficiently for that work to proceed later.
  
# 75. Relationship to G-L05
 
REC-01G recorded:
 `G-L05 Universal delegation / agency substrate BLOCKING FOR DELEGATED EXECUTION ` 
DELEGATION-001 has now supplied:
 `PH5-A Direct Delegation Grant  PH5-B Parent / Lineage Contract  PH5-C Agency Binding Contract ` 
Therefore the **semantic architecture underlying G-L05 is now substantially closed**.
 
G-L05 cannot yet be declared physically closed because:
 
 
- PH5-D proof requirements remain;
 
- PH5-E adversarial contract simulation remains;
 
- CLOSURE-02 temporal-authority ownership remains;
 
- V2 physical leaf representation is not yet ratified.
 

  
# 76. Current PH5-C determination
 `DELEGATION-001-PH5-C AGENCY BINDING CONTRACT  STATUS:   SEMANTIC CONTRACT SYNTHESIS COMPLETE  AGENCY BINDING:   DERIVED EXECUTION CONSTRUCT  PERSISTENT REALITY ENTITY:   NO  NEW V2 TOP-LEVEL PARTITION:   NO  SEMANTIC HOME:   PARTICIPATION  AUTHORITATIVE AGENCY STATE:   CONSTITUTIONAL STATE  PROOF STATE:   EVIDENCE / ATTESTATION STATE  CARDINALITY:   EXECUTION = 0..N BINDINGS  EACH BINDING:   EXACTLY 1 ACTOR   EXACTLY 1 GOVERNED SUBJECT   EXACTLY 1 DETERMINATE TERMINAL AGENCY BASIS  SELF-EXECUTION:   ZERO AGENCY BINDING  ACTOR != GOVERNED SUBJECT:   EXPLICIT AGENCY BINDING REQUIRED  UNKNOWN ACTOR:   REPRESENTABLE GENERALLY   CANNOT SATISFY IDENTIFIED DELEGATE BINDING  AGENCY BASIS:   ROLE ASSIGNMENT   OR   DIRECT DELEGATION GRANT  LINEAGE:   COMPLETE / DERIVABLE   NON-AUTHORITATIVE  GOVERNED SUBJECT:   EXPLICIT CORRESPONDENCE REQUIRED  DELEGATOR = GOVERNED SUBJECT:   NOT REQUIRED  AUTHORITY ISSUER = GOVERNED SUBJECT:   NOT REQUIRED  ACTION:   SEPARATE V2 COORDINATE   SNAPSHOT-BOUND TO AGENCY  TARGET:   SEPARATE V2 COORDINATE   SNAPSHOT-BOUND TO AGENCY  INTENT ORIGINATOR:   INDEPENDENT  TRUST:   NOT CREATED  AUTHORIZATION:   NOT CREATED  RI:   MAY VERIFY COHERENCE   MAY NOT DISCOVER / INVENT / REPAIR AGENCY  DLG-GAP-04:   CLOSED AT SEMANTIC CONTRACT LEVEL  IMPLEMENTATION AUTHORITY:   NONE  NEXT:   DELEGATION-001-PH5-D   DELEGATION PROOF REQUIREMENTS CONTRACT ` 
**PH5-C is ready to hand off to `DELEGATION-001-PH5-D — Delegation Proof Requirements Contract`.**