# DELEGATION-001-PH5-B — Delegation Parent & Lineage Contract
 
## Parent Binding, Derivation, Attenuation, Subdelegation & Revocation
 
  
 
Field
 
Determination
 
   
 
**Parent Constitution**
 
`DELEGATION-001 — Universal Delegation & Agency Constitution`
 
 
 
**Parent Packet**
 
`DELEGATION-001-PH5-A — Delegation Grant Relationship Contract`
 
 
 
**Phase**
 
`PH5-B`
 
 
 
**Classification**
 
SECONDARY CONSTITUTIONAL / AUTHORITY-LINEAGE CONTRACT
 
 
 
**Primary Semantic Authority**
 
POL
 
 
 
**Relationship Substrate**
 
WS
 
 
 
**Execution Consumer**
 
RI / V2
 
 
 
**Implementation Authority**
 
**NONE**
 
 
 
**Repository Mutation Authority**
 
**NONE**
 
 
 
**New ZRM Primitive**
 
**NONE**
 
 
 
**New Lineage Entity**
 
**NONE**
 
 
 
**Status**
 
**OPEN — CONTRACT SYNTHESIS EXECUTED**
 
  
  
# 1. Governing Question
 
PH5-B asks:
 
 
**How does one lawful Delegation derive from another constitutional Authority without losing origin, exceeding scope, creating circular Authority, bypassing revocation, or creating a second authoritative lineage object?**
 
 
PH5-A closed the direct-grant relationship:
 `Delegator Subject       │       │ DELEGATES_AUTHORITY_TO       ▼ Delegate Subject ` 
But that only closes a single grant.
 
PH5-B must close:
 `Authority Origin       ↓ Delegation       ↓ Delegated Authority       ↓ Subdelegation       ↓ Delegated Authority       ↓ ... `  
# 2. POL already establishes the lineage law
 
POL gives the decisive rules:
 
 
- Delegated Authority is subordinate to originating Authority.
 
- Delegation cannot exceed its origin.
 
- every Delegation preserves provenance back to originating Authority;
 
- Delegation is explicit;
 
- Delegation is independently revocable;
 
- Delegation is temporally bounded;
 
- dependent Delegations become invalid when their parent Authority loses validity.
 

 
Therefore:
 
 
**Delegation lineage is not optional metadata. It is part of the constitutional validity of delegated Authority.**
 
 
A Delegation whose origin cannot be reconstructed is constitutionally incomplete.
  
# 3. No separate authoritative `DelegationLineageRecord`
 
ZRM's higher-order law favors composition of existing constitutional structures and prohibits creating unnecessary new primitives where a higher-order structure can be derived.
 
PH5-A already gives each direct grant an immutable governed Relationship identity.
 
Role-based delegation already has an authoritative Role Assignment.
 
POL already requires every child Delegation to derive from valid parent Authority.
 
Therefore full lineage can be reconstructed from authoritative grant-by-grant parent bindings.
 
## PH5-B-01 — Lineage Derivation
 
 
**Delegation Lineage SHALL be derived from authoritative Authority and Delegation artifacts. It SHALL NOT become a parallel source of constitutional Authority.**
 
 
Therefore PH5-B rejects:
 `DelegationLineageRecord DelegationChainEntity AuthorityPathRecord ` 
as independent constitutional truth.
 
A materialized lineage may exist later for:
 
 
- execution transport;
 
- proof;
 
- caching;
 
- indexing;
 
- audit;
 

 
but it remains derived.
  
# 4. The fundamental object is the immediate parent
 
A child grant does not need to store the entire history of the constitutional universe.
 
It must identify its **immediate constitutional derivation basis**.
 
Conceptually:
 `Parent Basis      │      ▼ Delegation Grant Dn      │      ▼ Delegated Authority An ` 
From repeated immediate-parent traversal:
 `Dn  ↓ Dn-1  ↓ Dn-2  ↓ ...  ↓ Authority Origin ` 
the complete lineage is reconstructed.
 
## PH5-B-02 — Immediate Parent Requirement
 
 
Every Delegation that derives from already-delegated Authority SHALL bind its immediate constitutional parent basis.
 
 
No implicit parent selection is permitted.
  
# 5. Parent Basis is broader than Direct Delegation Grant
 
This is essential because `DELEGATION-001` supports both:
 `ROLE-BASED DELEGATION ` 
and:
 `DIRECT / MANDATE DELEGATION ` 
Therefore a child Delegation may derive from Authority carried through:
 `Role Assignment ` 
or:
 `Delegation Grant ` 
or directly from a legitimate non-delegated Authority origin where this is the first delegation hop.
 
The universal semantic abstraction is:
 
# **Parent Authority Basis**
 
It may resolve to:
 `A. Originating Authority  B. Role Assignment    carrying Delegated Authority  C. Direct Delegation Grant    carrying Delegated Authority ` 
The final physical discriminated-reference contract belongs to implementation-contract closure.
 
PH5-B establishes the semantic requirement only.
  
# 6. Parent relationship is not WS supersession
 
This distinction must be permanent.
 
WS defines supersession as lifecycle metadata:
 `relationship_id supersession_chain_id supersedes_id superseded_by_id supersession_rationale ` 
Supersession chains are linear and branching is prohibited.
 
That answers:
 
 
**Which newer constitutional Relationship replaced this Relationship?**
 
 
Delegation parentage answers something entirely different:
 
 
**From which Authority did this Delegation derive its power?**
 
 
Therefore:
 `supersedes_id       ≠ parent delegation ` 
and:
 `supersession_chain       ≠ delegation lineage ` 
## DLG-B01 — Supersession/Derivation Separation
 
 
WS supersession metadata SHALL NOT be reused to encode Delegation parentage.
 
  
# 7. Delegation lineage may branch
 
WS supersession chains cannot branch because one relationship history has one linear replacement sequence.
 
Delegation is different.
 
POL explicitly permits sibling Delegations to be independently revocable.
 
Therefore this must be lawful:
 `              Authority A0               /         \              /           \            D1             D2            ↓              ↓         Subject B      Subject C ` 
and:
 `                D1               /    \              /      \            D3        D4 ` 
if lawful subdelegation exists.
 
Therefore:
 
# **PH5-B-03 — Delegation Lineage Is Branchable**
 
Delegation derivation MAY branch.
 
This is not a contradiction with WS's prohibition on branching **supersession** chains.
 
They are different structures.
  
# 8. But each grant has one determinate immediate derivation basis by default
 
Branching downward is valid.
 
Ambiguous convergence upward is not automatically valid.
 
Consider:
 `D5  ↑ ? derived from D2 + D3 + D7 ` 
without any governing composition law.
 
It would be impossible to determine:
 
 
- effective scope;
 
- temporal intersection;
 
- revocation behavior;
 
- which parent permits subdelegation;
 
- which parent controls provenance.
 

 
Therefore:
 
## PH5-B-04 — Determinate Parentage
 
 
A Delegation Grant SHALL possess one determinate immediate Authority derivation basis unless another ratified constitutional construct explicitly defines joint Authority composition.
 
 
This does not prohibit future jointly held Authority.
 
It prohibits implementation-defined blending.
  
# 9. Multi-authority composition remains separate
 
There may be real-world situations where:
 `Authority A + Authority B ` 
are jointly required to create:
 `Authority C ` 
Examples could include joint signatures or multi-party constitutional approval.
 
PH5-B does not prohibit that.
 
It says only:
 
 
**Such composition must itself have a governed constitutional contract.**
 
 
PH5-B SHALL NOT invent:
 `parents[] ` 
and assume that arbitrary Authority union is lawful.
 
Until such a composition contract exists:
 `multiple implicit parents     → INVALID / NOT REPRESENTABLE `  
# 10. Delegation lineage must terminate in legitimate Authority origin
 
POL recognizes:
 
 
- Sovereign Authority;
 
- Institutional Authority;
 
- Delegated Authority;
 

 
and defines Delegated Authority as subordinate to its origin.
 
Therefore every valid chain must terminate at a constitutional Authority that is **not dependent upon the child chain itself**.
 
Conceptually:
 `D3  ↓ D2  ↓ D1  ↓ Institutional / Sovereign Authority ` 
not:
 `D1  ↓ D2  ↓ D3  ↓ D1 `  
# 11. Delegation derivation cycles are constitutionally invalid
 
RI explicitly warns that general ontological cycles may be valid; its cycle prohibition concerns only compilation dependencies.
 
Therefore PH5-B SHALL NOT claim:
 
 
“All Reality graph cycles are prohibited.”
 
 
They are not.
 
However Delegation lineage is not arbitrary topology.
 
POL requires:
 `child Authority     derives from parent Authority ` 
and requires complete traceability to an originating Authority.
 
A cycle such as:
 `A delegates to B B delegates to C C delegates back to A ` 
cannot establish constitutional Authority origin merely by circular reference.
 
The derivation never terminates.
 
Therefore:
 
# **DLG-B02 — Delegation Derivation Acyclicity**
 
 
The **Authority-derivation subgraph** of Delegation SHALL be acyclic.
 
 
This prohibition applies only to Authority derivation.
 
It does not prohibit unrelated structural or semantic cycles elsewhere in the Reality Graph.
  
# 12. Self-parenting is prohibited
 
The simplest invalid cycle is:
 `Delegation D1 parent = D1 ` 
This cannot create Authority.
 
Therefore:
 `parent(D) ≠ D ` 
is mandatory.
 
Likewise an indirect path:
 `D1 → D2 → D3 → D1 ` 
is invalid.
  
# 13. Parent identity must be exact
 
This is prohibited:
 `parent = latest delegation from Acme ` 
or:
 `parent = current Manager authority ` 
or:
 `parent = matching authority in Registry ` 
REC-01E explicitly rejects:
 
 
- latest;
 
- current fallback;
 
- nearest compatible;
 
- silent upgrades;
 

 
inside bound execution state.
 
The same law applies to Authority derivation.
 
## DLG-B03 — Exact Parent Identity
 
 
Parent Authority basis SHALL be identified exactly. No floating, latest, nearest, or dynamically substituted parent is constitutionally sufficient.
 
  
# 14. Scope attenuation is mandatory
 
POL's DR-002 states:
 
 
No delegated Authority may exceed the Authority possessed by the delegator.
 
 
Therefore every hop must satisfy:
 `scope(child) ⊆ scope(parent) ` 
where `scope` means the complete governed Authority constraints relevant to that Authority.
 
Potential dimensions include:
 `functional scope jurisdiction operational scope Action constraints Target constraints Capability constraints organizational scope other governed restrictions ` 
PH5-B does not create a universal scope bag.
 
The Authority constitution/source owns typed scope semantics.
  
# 15. Attenuation is conjunctive, not selective
 
A child cannot preserve one parent restriction while discarding another.
 
Suppose:
 `Parent:   Capability = procurement.purchase   Limit      = $50,000   Region     = Egypt   ValidTo    = 2026-12-31 ` 
A child cannot lawfully become:
 `Capability = procurement.purchase Limit      = $50,000 Region     = GLOBAL ` 
merely because its monetary limit stayed equal.
 
Every governing restriction must be respected.
 
Therefore:
 
# **DLG-B04 — Full-Dimension Attenuation**
 
 
A child Delegation SHALL be no broader than its parent across every constitutionally material Authority dimension.
 
  
# 16. Equal scope is allowed unless governing law requires further narrowing
 
Attenuation means:
 `child ⊆ parent ` 
not necessarily:
 `child ⊂ parent ` 
A parent may lawfully delegate the entirety of a delegable bounded Authority where constitutional law permits it.
 
Therefore:
 `scope(child) = scope(parent) ` 
can be valid.
 
What is prohibited is expansion.
  
# 17. Temporal attenuation
 
POL requires all Delegated Authority to be temporally bounded.
 
Therefore the child validity interval must fit within the period during which its parent basis is constitutionally valid.
 
Conceptually:
 `validity(child)        ⊆ validity(parent) ` 
For effective-dated authority:
 `child.validFrom ≥ parent.validFrom child.validTo   ≤ parent.validTo ` 
subject to the governing temporal model.
 
For event-bound Authority, the child must not survive the constitutional event that terminates its parent.
  
# 18. A child may not outlive its parent
 
This is invalid:
 `Parent: valid to 30 June  Child: valid to 31 December ` 
even if both records are structurally well-formed.
 
The child has no Authority source after the parent expires.
 
Thus:
 
# **DLG-B05 — Parent Temporal Ceiling**
 
 
No child Delegation may remain constitutionally valid outside the validity of its parent Authority basis.
 
  
# 19. Revocation can terminate validity before nominal expiry
 
Temporal containment alone is insufficient.
 
Example:
 `Parent validFrom = Jan 1 Parent validTo   = Dec 31  Parent revoked   = May 1  Child validTo    = Jun 30 ` 
The child does not remain valid until June.
 
POL says Authority ceases immediately upon constitutional revocation and dependent Delegations lose validity when the parent loses constitutional validity.
 
Therefore:
 `effective validity     = declared temporal bounds ∩ constitutional validity of parent `  
# 20. Subdelegation is not inherent in Delegated Authority
 
POL establishes that Delegation exists.
 
It does not say that every delegate may automatically delegate again.
 
Therefore PH5-B preserves:
 `Delegated Authority     ≠ automatic power to subdelegate ` 
A child grant requires a valid constitutional basis permitting the parent delegate to create further Delegation.
  
# 21. Subdelegation permission must be explicit or constitutionally entailed
 
A valid child Delegation requires both:
 `parent Authority covers child scope ` 
and:
 `parent permits delegation of that Authority onward ` 
The latter may be expressed by:
 
 
- governing instrument;
 
- Authority conditions;
 
- Policy;
 
- Role/Authority contract;
 
- another explicitly governed constitutional rule.
 

 
It SHALL NOT be inferred from:
 
 
- possession of Authority;
 
- membership;
 
- Role name;
 
- technical ability;
 
- API access;
 
- Trust;
 
- absence of prohibition.
 

 
Therefore:
 
# **DLG-B06 — No Default Subdelegation**
 
 
Silence SHALL NOT be interpreted as permission to subdelegate.
 
  
# 22. Subdelegation cannot repair a forbidden parent grant
 
If:
 `Parent delegation invalid ` 
then:
 `Child delegation ` 
cannot become valid merely because the child itself looks structurally correct.
 
The child depends constitutionally on the parent.
 
This follows directly from POL's Cascade Principle.
  
# 23. Revocation of a child is local downward
 
POL states that each Delegation is independently revocable from its siblings.
 
Suppose:
 `       D1       /  \     D2    D3     |     D4 ` 
If `D2` is revoked:
 `D2 = invalid D4 = invalid D3 = unaffected ` 
unless some independent rule affects `D3`.
 
Therefore:
 
# **DLG-B07 — Branch-Local Revocation**
 
 
Revocation of one Delegation invalidates that grant and all Delegations constitutionally dependent upon that branch, but SHALL NOT invalidate independent sibling branches merely because they share an ancestor.
 
  
# 24. Parent revocation cascades recursively
 
If:
 `D1 revoked ` 
then:
 `D2 invalid D3 invalid D4 invalid ... ` 
for every descendant relying upon D1.
 
This is not because the descendant Relationships disappear from history.
 
It is because their Authority basis is no longer constitutionally valid for current execution.
 
Therefore:
 `historical relationship exists        ≠ current delegated Authority valid ` 
REC-01E explicitly preserves this distinction.
  
# 25. Cascade does not mutate descendants
 
POL says the constitutional relationship is immutable even when parent validity is lost.
 
WS likewise prohibits Relationship mutation and uses lifecycle/supersession instead.
 
Therefore parent revocation SHALL NOT rewrite every descendant grant.
 
Instead:
 `D3 remains historically recorded ` 
while current evaluation derives:
 `D3 Authority invalid because ancestor D1 invalid ` 
This is cleaner and preserves provenance.
  
# 26. Derived validity versus stored status
 
This creates an important distinction.
 
A Relationship may still physically carry:
 `status = ACTIVE ` 
while an ancestor Authority has become invalid.
 
Therefore:
 `Relationship.status      ≠ full current Authority validity ` 
PH5-A already established this.
 
PH5-B strengthens it:
 
# **DLG-B08 — Lineage-Relative Validity**
 
 
Current Delegated Authority validity is a derived constitutional property of the grant **and its complete required Authority lineage**, not merely the local Relationship lifecycle state.
 
 
This matters enormously for execution.
  
# 27. No silent descendant re-parenting
 
Suppose parent `D1` expires and another similar grant `D9` now exists.
 
The system SHALL NOT do:
 `D2 old parent D1 invalid       ↓ find compatible D9       ↓ continue ` 
That would rewrite constitutional provenance.
 
REC-01E explicitly prohibits latest/current/nearest substitution.
 
Therefore:
 
# **DLG-B09 — No Automatic Re-Parenting**
 
 
A Delegation SHALL never migrate to a different parent Authority merely because the original parent becomes unavailable, revoked, superseded or expired.
 
 
A new constitutional grant is required.
  
# 28. Authority succession does not preserve delegation identity automatically
 
POL states constitutional succession does **not** preserve Authority identity:
 `old Authority terminates new Authority is constitutionally established ` 
while historical provenance remains.
 
Therefore a successor Authority does not silently become the new parent of all prior Delegations.
 
Whether existing Delegations survive succession must be explicitly established by the governing constitutional law.
 
Default behavior:
 `no automatic lineage migration `  
# 29. Superseded parent Relationship requires exact semantics
 
WS supersession means:
 `old Relationship     SUPERSEDED BY new Relationship ` 
but the historical old Relationship remains valid as historical fact.
 
A child Delegation originally derived from the old parent SHALL NOT automatically be rewritten to the superseding Relationship.
 
If the new Relationship must become the child's authority source:
 
 
a governed constitutional transition must explicitly establish that fact.
 
 
Otherwise lineage fidelity would be lost.
  
# 30. Historical lineage is immutable
 
For an execution at historical time `T1`, lineage must be reconstructed as it existed at `T1`.
 
Example:
 `T1: A0 → D1 → D2  T2: D1 revoked  T3: new D3 created ` 
Historical reconstruction of T1 must return:
 `A0 → D1 → D2 ` 
not:
 `A0 → D3 → D2 ` 
REC-01E requires exact historical constitutional state and forbids present-state substitution.
  
# 31. Historical validity and current validity are separate questions
 
A chain may be:
 `VALID at T1 INVALID at T3 ` 
without contradiction.
 
Thus:
 `historical lineage proof       ≠ current delegation authorization ` 
This must survive into PH5-C and V2 historical execution.
  
# 32. Lineage must be snapshot-bound for execution
 
REC-01E establishes that individually valid constitutional inputs do not necessarily form one valid execution state and that provenance must remain bound to exact snapshot coordinates.
 
Therefore an execution cannot supply:
 `D3 at State 20 parent D2 at State 18 origin Authority at State 22 ` 
without explicit constitutional compatibility.
 
Lineage state must belong to the execution's exact coherent snapshot.
  
# 33. Runtime shall not discover lineage
 
This remains non-negotiable.
 
RI receives explicit constitutional inputs.
 
It does not:
 `fetch parent search Registry resolve latest Authority repair missing branch guess lineage ` 
The Application/upstream constitutional composition process must provide the exact required lineage state.
 
Runtime may verify:
 
 
- presence;
 
- structural coherence;
 
- exact bound identities;
 
- permitted compatibility conditions;
 

 
within its lawful stage authority.
  
# 34. Absence of parent is not root Authority
 
A dangerous fallback would be:
 `parent missing       ↓ assume origin grant ` 
This is prohibited.
 
An origin Authority must be **positively established**.
 
Therefore the lineage representation must distinguish:
 `ROOT AUTHORITY BASIS ` 
from:
 `PARENT MISSING ` 
The latter fails closed.
  
# 35. Empty lineage is lawful only for non-delegated Authority
 
For self-execution under original Authority:
 `Delegation Lineage = none ` 
may be lawful.
 
For:
 `Actor ≠ Governed Subject ` 
with claimed delegated Authority:
 `lineage = empty ` 
cannot be interpreted as valid.
 
REC-01C already requires explicit constitutional justification where Actor and Governed Subject differ.
  
# 36. Mixed delegation forms are allowed
 
A lawful lineage may include different grant forms.
 
For example:
 `Organization       ↓ ASSIGNED_ROLE       ↓ Human Manager       ↓ Direct Delegation Grant       ↓ AI Agent ` 
if:
 
 
- the manager's Authority permits subdelegation;
 
- the child scope is lawful;
 
- every parent binding is explicit;
 
- SEC requirements are satisfied.
 

 
Likewise:
 `Direct Grant       ↓ Role Assignment ` 
is not categorically impossible if the governing constitutions lawfully establish it.
 
PH5-B SHALL NOT require every chain hop to use one physical grant form.
 
The invariant is shared Authority law, not storage uniformity.
  
# 37. Lineage normalization must not erase grant form
 
Although a lineage may be materialized into a common execution representation later, normalization SHALL preserve whether each authoritative hop originated through:
 `ROLE_ASSIGNMENT ` 
or:
 `DIRECT_DELEGATION_GRANT ` 
because the underlying constitutional source matters for provenance and verification.
 
A generic:
 `authorityHop ` 
representation may be permissible only if it preserves the authoritative artifact kind and identity.
  
# 38. Candidate lineage semantic structure
 
Without ratifying field names, the derived lineage must be capable of representing:
 `Delegation Lineage │ ├── root Authority basis │ └── ordered derivation hops        │        ├── parent basis        ├── child grant        ├── grant form        ├── delegator        ├── delegate        ├── authority/scope reference        ├── temporal bounds        ├── subdelegation basis        └── provenance/proof references ` 
This is an **execution/proof view**.
 
It is not new stored constitutional truth.
  
# 39. Canonical order is origin → Actor
 
For deterministic reasoning and eventual V2 canonicalization, PH5-B establishes a semantic ordering:
 `Authority Origin       ↓ first delegation       ↓ ...       ↓ final delegation       ↓ Actor ` 
The inverse traversal may be used operationally.
 
But the canonical semantic lineage order should follow derivation from origin toward the final Authority holder.
 
This mirrors POL's requirement for traceability back to the origin while giving execution one deterministic order.
 
The physical canonicalization rule remains G-L11 / CLOSURE-04 work.
  
# 40. Duplicate hops are prohibited
 
A lineage cannot contain:
 `D1 D2 D1 ` 
or the same authoritative grant twice.
 
Such duplication either:
 
 
- indicates a cycle;
 
- corrupts provenance;
 
- creates ambiguous attenuation.
 

 
Therefore each authoritative grant identity occurs at most once in one lineage path.
  
# 41. Broken lineage fails closed
 
If any required hop is:
 
 
- missing;
 
- unknown where required;
 
- unresolved;
 
- invalid;
 
- temporally incompatible;
 
- revoked;
 
- improperly broadened;
 
- unauthenticated where proof is required;
 

 
the final delegated Authority cannot be established.
 
The system SHALL NOT simply remove the bad hop and continue with the remainder.
 
That would fabricate an Authority path that never existed.
  
# 42. Scope failure anywhere invalidates the downstream branch
 
Consider:
 `D1 scope = READ + WRITE D2 scope = WRITE D3 scope = READ ` 
If D3 derives from D2:
 `READ ⊄ WRITE ` 
therefore D3 is invalid.
 
It cannot appeal directly to D1 while claiming parent D2.
 
Parentage determines the derivation path.
 
A child does not get to skip an inconvenient ancestor.
  
# 43. Temporal failure behaves similarly
 
Suppose:
 `D1: Jan–Dec D2: Mar–Jun D3: May–Sep ` 
D3 cannot lawfully run through September merely because D1 is still valid.
 
Its immediate parent D2 ends in June.
 
Therefore effective child validity is constrained by **every ancestor**, which naturally follows from repeated parent containment.
  
# 44. Descendant validity formula
 
Conceptually, current validity of Delegation `Dn` requires:
 `Valid(Dn, T) = LocalValid(Dn, T)  AND Valid(Parent(Dn), T)  AND Scope(Dn) ⊆ Scope(Parent(Dn))  AND SubdelegationPermitted(Parent(Dn), Dn)  AND RequiredProofValid(Dn, T) ` 
recursively until the legitimate Authority origin is reached.
 
This is semantic law.
 
It is not implementation code.
  
# 45. Root Authority formula
 
The recursion terminates only where the parent basis is a legitimate non-child-dependent Authority origin satisfying POL's Authority prerequisites.
 
Conceptually:
 `ValidOrigin(A, T) = Identity valid AND Standing valid AND Capacity valid AND legitimate Authority origin AND other governing requirements ` 
POL explicitly requires these Authority prerequisites.
 
PH5-B does not redefine them.
  
# 46. Lineage proof and Authority validity remain separate
 
A chain may be perfectly reconstructable:
 `A0 → D1 → D2 ` 
while current validity fails because:
 `D1 revoked ` 
Thus:
 `lineage complete     ≠ lineage currently valid ` 
and:
 `provenance complete     ≠ authorization granted ` 
This distinction prevents auditability from becoming Permission.
  
# 47. Attestation does not replace lineage
 
Phase 4 already established:
 `Delegation Chain     ≠ Attestation Chain ` 
That remains essential.
 
A signed attestation saying:
 `D2 valid ` 
does not erase the need for constitutionally governed Authority lineage where POL requires it.
 
Attestation proves a claim according to its contract.
 
It does not create the parent chain.
  
# 48. Cross-domain recognition does not repair lineage
 
POL explicitly says:
 `Recognition ≠ Delegation ` 
and cross-domain Authority requires explicit constitutional recognition.
 
Therefore a Delegation path crossing constitutional domains may require both:
 `valid Delegation lineage + valid cross-domain recognition ` 
Recognition cannot substitute for a missing parent grant.
 
Delegation cannot substitute for missing recognition.
  
# 49. Emergency Authority does not bypass lineage law
 
Emergency Authority may possess different constitutional source rules.
 
But once Emergency Authority is delegated:
 `DR-001 → DR-007 ` 
still govern unless POL explicitly provides an exception.
 
PH5-B does not create an emergency shortcut.
  
# 50. Proposed parent-reference semantics
 
PH5-B now establishes the semantic contract for a child Delegation:
 `Delegation Derivation Binding  kind:   ORIGIN_AUTHORITY   or   ROLE_ASSIGNMENT   or   DIRECT_DELEGATION_GRANT  reference:   exact authoritative artifact identity ` 
These labels are conceptual.
 
They are **not** yet authorized implementation enums.
 
The important decision is that parent type must be explicit enough to resolve the correct constitutional artifact without heuristic guessing.
  
# 51. Why parent basis should not be a generic string
 
This would be constitutionally weak:
 `parentId: string ` 
because Runtime/Application would not know what constitutional contract governs that referenced identifier.
 
Therefore the physical contract eventually requires a typed constitutional reference.
 
That belongs to the G-L06/V2 leaf-contract work.
 
PH5-B merely closes the semantic need.
  
# 52. Cycle validation ownership
 
The Constitution now clearly requires delegation-derivation acyclicity.
 
But PH5-B SHALL NOT assign final operational owner prematurely.
 
Potential responsibilities include:
 `WS / Registry   structural parent-reference integrity  POL   Authority derivation validity  Application   exact lineage resolution/materialization  SEC   proof/trust requirements  RI   execution-envelope coherence ` 
The exact distribution belongs to `CLOSURE-02` and implementation closure.
 
What is closed is:
 
 
**No component may treat a cyclic Authority derivation as valid.**
 
  
# 53. Parent revocation visibility at execution
 
A stale but internally coherent chain is dangerous:
 `D1 valid when assembled D1 revoked before T_e_input D2 still references D1 ` 
PH5-B confirms the constitutional result:
 `D2 cannot authorize execution at T_e_input ` 
But determining the authoritative current revocation state remains the specific unresolved ownership problem already assigned to:
 `CCP-RI-CLOSURE-02 ` 
Thus PH5-B closes **what the result must be**, not **who performs the authoritative temporal determination**.
  
# 54. Historical branch reconstruction
 
A historical lineage reconstruction must preserve:
 `exact grant identities exact parent bindings exact Authority sources exact scopes exact temporal state exact revocation state at historical coordinate exact artifact versions where relevant ` 
It must not rewrite a past branch according to today's graph.
 
This directly inherits REC-01E's historical snapshot law.
  
# 55. PH5-B adversarial examples
 
## B-SIM-01 — Valid direct chain
 `Acme   ↓ D1: procurement ≤ $100k Provider   ↓ D2: procurement ≤ $20k AI Agent ` 
If D1 allows subdelegation and both are valid:
 
**PASS**
  
## B-SIM-02 — Scope expansion
 `D1 = ≤ $20k D2 = ≤ $100k ` 
**REJECT**
 
`D2 > D1`.
  
## B-SIM-03 — Temporal expansion
 `D1 valid through June D2 valid through December ` 
**REJECT**
 
Child exceeds parent temporal validity.
  
## B-SIM-04 — Forbidden subdelegation
 `D1 grants B Authority D1 prohibits subdelegation B creates D2 to C ` 
**REJECT**
  
## B-SIM-05 — Missing parent
 `D2.parent = unavailable ` 
but D2 claims delegated Authority.
 
**FAIL CLOSED**
 
Do not promote D2 to origin Authority.
  
## B-SIM-06 — Parent revoked
 `D1 revoked at T2 execution at T3 D2 otherwise valid ` 
**REJECT CURRENT EXECUTION**
 
Historical T1 reconstruction remains possible.
  
## B-SIM-07 — Sibling independence
 `      D1      /  \    D2    D3 ` 
D2 revoked.
 
**D2 branch invalid. D3 unaffected**, absent another governing cause.
  
## B-SIM-08 — Cycle
 `D1 → D2 → D3 → D1 ` 
**REJECT**
 
No legitimate Authority origin can be derived through the cycle.
  
## B-SIM-09 — Automatic re-parent
 `D1 expires D9 similar and current system silently changes D2.parent D1→D9 ` 
**REJECT**
 
New constitutional grant required.
  
## B-SIM-10 — Mixed chain
 `Organization     ↓ ASSIGNED_ROLE Manager     ↓ Direct Delegation Grant AI Agent ` 
**POTENTIALLY VALID**
 
provided parent Authority permits subdelegation and all other rules pass.
  
## B-SIM-11 — Historical replay
 `D1 active T1 D2 active T1 D1 revoked T2 reconstruct T1 at T3 ` 
**PASS HISTORICAL RECONSTRUCTION**
 
without creating current Authority.
  
## B-SIM-12 — Relationship superseded
 `D1 superseded by D9 D2 originally derives from D1 ` 
System silently treats D9 as D2 parent.
 
**REJECT**
 
Supersession is not lineage rebinding.
  
# 56. PH5-B invariants
 
### `DLG-B01 — Supersession/Derivation Separation`
 
Supersession metadata SHALL NOT encode Delegation parentage.
 
### `DLG-B02 — Derivation Acyclicity`
 
The Delegation Authority-derivation subgraph SHALL be acyclic.
 
### `DLG-B03 — Exact Parent Identity`
 
Every child Delegation SHALL bind an exact parent Authority basis.
 
### `DLG-B04 — Full-Dimension Attenuation`
 
Child Authority SHALL not exceed parent Authority across any constitutionally material dimension.
 
### `DLG-B05 — Parent Temporal Ceiling`
 
A child Delegation SHALL not outlive its parent Authority basis.
 
### `DLG-B06 — No Default Subdelegation`
 
Delegated Authority SHALL not imply permission to delegate again.
 
### `DLG-B07 — Branch-Local Revocation`
 
Independent sibling Delegations remain independently revocable.
 
### `DLG-B08 — Lineage-Relative Validity`
 
Current Delegated Authority validity depends upon the complete required Authority lineage.
 
### `DLG-B09 — No Automatic Re-Parenting`
 
A grant SHALL not silently migrate to a new parent Authority.
 
### `DLG-B10 — Root Must Be Positive`
 
Absence of parent SHALL not be interpreted as proof of origin Authority.
 
### `DLG-B11 — Determinate Derivation`
 
Every Delegation hop SHALL possess a determinate constitutional derivation path.
 
### `DLG-B12 — No Skip-Ancestor Validation`
 
A child SHALL not bypass an invalid immediate ancestor by appealing directly to a higher valid ancestor.
 
### `DLG-B13 — Immutable Historical Lineage`
 
Historical parent bindings SHALL remain reconstructable exactly as originally established.
 
### `DLG-B14 — Mixed Grant Forms Permitted`
 
Delegation lineage MAY compose Role Assignments and Direct Delegation Grants where every transition is lawfully governed.
 
### `DLG-B15 — Lineage Is Derived`
 
A materialized Delegation Lineage SHALL remain non-authoritative and traceable to its authoritative source grants.
  
# 57. PH5-B semantic lineage contract
 
The resulting universal semantic contract is:
 `LEGITIMATE AUTHORITY ORIGIN           │           ▼    Delegation Basis D1           │           │ parent = Origin           ▼    Delegated Authority A1           │           │ subdelegation permitted?           ▼    Delegation Basis D2           │           │ parent = D1/A1           ▼    Delegated Authority A2           │          ...           │           ▼       Final Actor ` 
For every transition:
 `EXPLICIT GRANT + EXACT PARENT + PARENT VALIDITY + SCOPE ATTENUATION + TEMPORAL ATTENUATION + SUBDELEGATION PERMISSION + PROVENANCE + REQUIRED PROOF ` 
must hold.
  
# 58. What PH5-B closes
 
Before this packet:
 `DLG-GAP-02 Delegation parent / lineage representation     OPEN ` 
After PH5-B:
 `DLG-GAP-02 SEMANTIC CONTRACT:     CLOSED ` 
Specifically closed:
 
 
- immediate parent requirement;
 
- root Authority termination;
 
- branchable delegation topology;
 
- acyclic derivation;
 
- exact parent identity;
 
- attenuation;
 
- temporal intersection;
 
- subdelegation permission;
 
- branch-local revocation;
 
- recursive cascade;
 
- no re-parenting;
 
- supersession separation;
 
- historical lineage preservation;
 
- derived, non-authoritative full lineage.
 

  
# 59. Physical details intentionally deferred
 
PH5-B does not yet ratify:
 `parentAuthorityId parentDelegationId parentKind enum DelegationLineage interface lineageHash lineageDepth database foreign keys graph traversal algorithm cycle-detection algorithm ` 
These are implementation-contract concerns.
 
No implementation agent may infer them independently.
  
# 60. Relationship with PH5-C
 
PH5-B now tells PH5-C exactly what an Agency Binding may rely upon:
 `Actor       │       ▼ exact authoritative Delegation Basis       │       ▼ complete derivable Delegation Lineage       │       ▼ legitimate Authority Origin ` 
PH5-C must answer:
 
 
**How is that valid agency state bound to one specific execution's ACTOR and GOVERNED_SUBJECT role(s) without turning the Agency Binding itself into Authority?**
 
  
# 61. Current PH5-B determination
 `DELEGATION-001-PH5-B DELEGATION PARENT & LINEAGE CONTRACT  STATUS:   SEMANTIC CONTRACT SYNTHESIS COMPLETE  LINEAGE:   DERIVED   NON-AUTHORITATIVE  IMMEDIATE PARENT:   REQUIRED  PARENT BASIS:   EXACT   TYPED SEMANTICALLY   MAY BE:     ORIGIN AUTHORITY     ROLE ASSIGNMENT     DIRECT DELEGATION GRANT  TOPOLOGY:   MAY BRANCH DOWNWARD  MULTIPLE IMPLICIT PARENTS:   PROHIBITED  DERIVATION CYCLES:   PROHIBITED  GENERAL REALITY GRAPH CYCLES:   NOT PROHIBITED BY THIS PACKET  SCOPE:   CHILD ⊆ PARENT  TIME:   CHILD VALIDITY ⊆ PARENT VALIDITY  SUBDELEGATION:   EXPLICIT PERMISSION REQUIRED  PARENT REVOCATION:   INVALIDATES DEPENDENT BRANCH  CHILD REVOCATION:   INVALIDATES ITS DESCENDANTS   DOES NOT INVALIDATE INDEPENDENT SIBLINGS  SUPERCESSION:   NOT DELEGATION PARENTAGE  RE-PARENTING:   NEVER AUTOMATIC  HISTORICAL LINEAGE:   IMMUTABLY RECONSTRUCTABLE  MIXED ROLE/DIRECT CHAINS:   PERMITTED WHEN LAWFUL  DLG-GAP-02:   CLOSED AT SEMANTIC CONTRACT LEVEL  IMPLEMENTATION AUTHORITY:   NONE  NEXT:   DELEGATION-001-PH5-C   AGENCY BINDING CONTRACT ` 
**PH5-B is now ready to hand off to `PH5-C — Agency Binding Contract`.**