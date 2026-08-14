# Z-PROF — D5-R1
 
## Profile Composition & Interrogation Investigation
 
**Document ID:** `Z-PROF-D5-R1` **Dimension:** D5 — Profile Composition & Interrogation **Round:** 1 **Status:** `DRAFT — COUNCIL INVESTIGATION INSTRUMENT` **Program:** Z-PROF **Authority:** Zyppi Constitutional Council **Implementation Authority:** `NONE` **Depends On:** D1 — Constitutional Fit; D2-R3 — Existing Repository Reality **Feeds:** D3 — Alternative Architectures; D4 — Application Stress Tests
  
# 1. Purpose
 
D5 investigates the most strategically important unresolved part of Z-PROF:
 
 
**What is a Profile, what does it contain, what may it interrogate, what may it derive, and how can multiple Profiles compose without creating semantic, constitutional, or operational conflict?**
 
 
D5 does not select implementation technology.
 
D5 does not create an implementation package.
 
D5 does not authorize a Profile Registry.
 
D5 does not assume that the previously proposed `DomainJudgment`, `Profile Brain`, `Interrogation DSL`, or `Profile Bundle` concepts are valid.
 
Instead, D5 must first determine whether those concepts are actually required.
  
# 2. Critical Discovery: “Profile” Already Exists
 
The first D5 finding is a nomenclature and architecture collision.
 
ARM-001 already defines a Profile.
 
ARM-001 §7 states that a Profile is:
 
 
a constitutional extension of the ARM-001 core declaring attributes, projection support declarations, and state-label vocabulary specific to an asset class.
 
 
The existing Profile architecture includes:
 `ARM-001 Asset Reality         │         └── Profile              ├── ARM-P-001 Product              ├── ARM-P-002 Document              ├── ARM-P-003 Location              ├── ARM-P-004 Device / Vehicle              └── ARM-P-005 Person ` 
ARM-001 also establishes:
 
 
- Profile Minimalism;
 
- Profile Isolation;
 
- Profile Projection Declaration;
 
- No First-Profile Privilege;
 
- an independent Profile Registry;
 
- prohibition on Profile-to-Profile dependencies.
 

 
Therefore:
 
 
**Z-PROF cannot proceed using “Profile” as an undefined generic container without first resolving its relationship to ARM-P-NNN.**
 
 
This is the first and highest-priority D5 question.
  
# 3. Existing Profile Meaning
 
D5 shall treat the following as existing architectural evidence, not assumptions.
 
### ARM Profile
 
An ARM Profile specializes an Asset Reality.
 
Its responsibility includes:
 
 
- asset-class-specific attributes;
 
- projection support declarations;
 
- state-label vocabulary;
 
- profile-specific specialization.
 

 
ARM-001 explicitly states that Profiles are implementation specifications rather than constitutional foundations and that they extend downward from ARM-001 rather than upward into it.
 
### Semantic Projection
 
ZRM-005 defines Semantic Projection independently.
 
A Semantic Projection maps existing Reality into semantic constructs and is governed by:
 
 
- **PR-001 — No New Facts**
 
- **PR-002 — Reversibility of Reference**
 

 
A projection may relabel, aggregate, or interpret existing structure, but may not introduce unsupported Reality.
 
### Translation Layer
 
SIOS separately identifies Translation Layers as the place where:
 
 
domain-specific language is translated into constitutional concepts.
 
 
This is a different responsibility from merely defining an asset-class Profile.
 
### Intelligence
 
ARM-001 explicitly separates raw observations from interpretation:
 
 
- observations are raw immutable facts;
 
- interpretations such as trust scores, risk classifications, pattern detection, and supply-chain intelligence belong to Intelligence.
 

 
D5 must therefore avoid collapsing all four concepts:
 `Profile Projection Translation Intelligence ` 
into one generic “Profile Engine.”
  
# 4. D5 Central Question
 
The central question is:
 
 
**What constitutional object does Z-PROF actually need?**
 
 
Candidate models:
 
### Model A — Profile = Asset Profile
 
Z-PROF uses existing `ARM-P-NNN`.
 `ARM-001    │    └── ARM-P-001 Product           │           ├── GS1 projection           ├── DPP projection           └── EPCIS projection ` 
Under this model, Z-PROF is not a new Profile system.
 
It becomes a capability that operates *through* existing Profiles.
  
### Model B — Z-PROF = Domain Translation Profile
 
A second profile concept exists above ARM Profiles.
 `ARM Profile       │       ▼ Z-PROF Domain Profile       │       ▼ Domain Projection / Judgment ` 
This would require a new name or explicit constitutional distinction because the existing word “Profile” already has a defined meaning.
  
### Model C — Profile = Composite Governed Bundle
 
A Profile is not a single semantic object but a composition:
 `Profile  ├── Asset-Class Declaration  ├── Semantic Vocabulary  ├── Projection Declarations  ├── Interrogation Requirements  ├── Derivation Rules  ├── Judgment Rules  ├── Context Requirements  └── Governance Metadata ` 
This is powerful but creates a much larger constitutional surface.
  
### Model D — No New Profile Object
 
The apparent Z-PROF requirement may actually be a composition of already-existing concepts:
 `ARM Profile + ZRM Semantic Projection + SIOS Translation Layer + Intelligence + PRJ Projection Architecture + POL / SEC / RI ` 
Under this model:
 
 
Z-PROF becomes an orchestration/governance architecture rather than a new constitutional primitive.
 
 
This possibility must be investigated seriously.
  
# 5. D5 Rule: Do Not Solve a Naming Problem by Creating a New Primitive
 
ZRM-002 establishes that semantic meaning and projection belong downstream, with Semantic Meaning and Projection explicitly deferred to ZRM-005.
 
ZRM-006 further establishes that downstream constructs must specialize existing ZRM-005 derivations rather than create competing ontology.
 
Therefore:
 
 
**D5 SHALL NOT introduce a new primitive merely because the existing Profile vocabulary is inconvenient.**
 
 
If Z-PROF requires a new construct, D5 must demonstrate:
 
 
1. why existing constructs cannot express it;
 
2. what existing construct it specializes;
 
3. what constitutional owner it has;
 
4. why it cannot belong to ARM, ZRM, PRJ, SIOS Translation, Intelligence, or Experience.
 

  
# 6. Profile Composition
 
D5 shall investigate composition at four distinct levels.
 
## 6.1 Asset Composition
 
Can one Asset Reality have:
 `one Profile ` 
or:
 `multiple Profiles ` 
?
 
ARM-001 currently establishes a Profile declaration attached to an Asset Reality and reserves independent profile classes.
 
It also explicitly prohibits Profile-to-Profile dependencies.
 
D5 must determine whether that prohibition means:
 `Asset → exactly one Profile ` 
or permits:
 `Asset → Profile Set ` 
while still prohibiting direct Profile dependency.
  
# 7. Profile Composition vs Profile Dependency
 
These are not the same.
 
### Dependency
 `Profile A    ↓ requires Profile B ` 
ARM-001 currently prohibits this.
 
### Composition
 `Asset  ├── Product Profile  ├── Regulatory Context  └── Jurisdiction Context ` 
where none of the profiles directly depends on another.
 
D5 must determine whether composition can exist without violating Profile Isolation.
 
This distinction becomes critical when testing:
 
 
- products;
 
- logistics units;
 
- vehicles;
 
- locations;
 
- documents;
 
- regulated persons;
 
- healthcare objects;
 
- financial instruments.
 

  
# 8. Domain Composition
 
The same Reality may participate in multiple domains.
 
For example:
 `Physical Product       │       ├── GS1       ├── DPP       ├── Customs       ├── Logistics       ├── Recall       ├── Sustainability       └── Consumer Experience ` 
The naive solution is:
 `one domain = one Profile ` 
but that creates potentially hundreds or thousands of Profiles.
 
D5 must investigate whether the architecture should instead distinguish:
 `Asset Profile ` 
from:
 `Domain Projection ` 
and:
 `Application / Use-Case Profile ` 
This may be the key to avoiding the “hundreds of wedges → hundreds of profiles” problem.
  
# 9. Profile as Capability Declaration
 
ARM-001 already states that a Profile declares supported projections.
 
Therefore D5 must investigate whether Profile is primarily:
 
 
**a declaration of what an Asset Reality can legitimately participate in**
 
 
rather than:
 
 
**the engine that performs the participation.**
 
 
This distinction is crucial.
 
A Profile could declare:
 `Product Profile  ├── supports GS1 Digital Link  ├── supports EPCIS  └── supports DPP ` 
while separate projection architectures determine how those projections are generated.
 
ARM-001 already points toward exactly this separation: projection content and generation mechanics belong to PRJ-001 and successors.
  
# 10. Interrogation
 
D5 shall define **Interrogation** before defining an Interrogation DSL.
 
Interrogation means:
 
 
determining what constitutional information must be obtained or made available before a particular Profile operation can be evaluated.
 
 
Example:
 `GS1 Product projection         │         ├── GTIN         ├── identity evidence         ├── relevant state         └── authorized projection support ` 
The question is not initially:
 
 
“How do we query PostgreSQL?”
 
 
The question is:
 
 
**“What constitutional information does this semantic operation require?”**
 
  
# 11. Interrogation Contract
 
A future Interrogation Contract may conceptually resemble:
 `Interrogation Requirement  subject:     Asset Reality  required:     Identity     Referent     State     Evidence  optional:     Event history  constraints:     jurisdiction     temporal context     authorization context ` 
This is illustrative only.
 
D5 must determine whether such a construct is needed.
 
It must not assume:
 
 
- GraphQL;
 
- JSON Schema;
 
- SHACL;
 
- SQL;
 
- SPARQL;
 
- custom DSL;
 
- function calls;
 
- API queries.
 

 
Those are D3 questions.
  
# 12. Interrogation Must Not Become Data Access
 
A critical boundary:
 `Profile    │    │ semantic requirement    ▼ Interrogation Contract    │    │ application orchestration    ▼ Registry / Evidence / other sources ` 
not:
 `Profile    │    ├── SQL    ├── PostgreSQL    ├── R2    └── HTTP ` 
The M08 reconnaissance confirms that Registry and Evidence adapters reside in the Application layer while the Constitutional Runtime remains pure and zero-I/O.
 
Therefore:
 
 
**Interrogation describes required knowledge; it does not own infrastructure access.**
 
  
# 13. Interrogation as a Demand Graph
 
D5 shall investigate whether interrogation is better represented as a graph of requirements.
 
Example:
 `Profile    │    └── requires           │           ▼        Product           │           ├── Identity           ├── State           ├── Evidence           │     ├── provenance           │     └── verification           └── Events ` 
The Application layer then resolves the requirements into explicit inputs.
 
This potentially aligns naturally with the existing Runtime's deterministic graph-oriented architecture without requiring Profile logic inside Runtime.
 
But this remains an architectural hypothesis.
  
# 14. Projection vs Interrogation
 
D5 must preserve this distinction:
 `Interrogation     asks:     "What do I need to know?"  Projection     answers:     "How do I express what is known?"  Judgment     asks:     "What conclusion follows from what is known?" ` 
These are three different operations.
 
Therefore:
 `Interrogation        ↓ Verified Constitutional Inputs        ↓ Projection        ↓ Domain Interpretation        ↓ Judgment ` 
is a candidate pipeline, not yet a constitutional fact.
  
# 15. Judgment
 
D5 must determine whether Z-PROF actually needs a first-class `DomainJudgment`.
 
Candidate possibilities:
 
### A — No Judgment Object
 
Z-PROF only creates projections.
 `Reality  ↓ Projection ` 
### B — Derived Domain Judgment
 `Reality  + Profile  + Evidence  ↓ Domain Judgment ` 
### C — Intelligence Result
 
Domain judgments are simply a specialized form of existing Intelligence.
 `Reality  ↓ Intelligence  ↓ Domain Judgment ` 
### D — Outcome
 
Domain judgment is an extension of the existing Outcome family.
 
### E — Profile-local result
 
Judgment remains an application-level result and never becomes constitutional.
 
D5 must investigate all five.
  
# 16. Judgment Must Not Automatically Become Truth
 
The foundational rule from SIOS and ARM is:
 
 
Reality exists independently of the model.
 
 
ARM-001 explicitly states that observations are raw facts and interpretations belong to Intelligence.
 
Therefore:
 `Domain Judgment       ≠ Reality ` 
and:
 `Domain Judgment       ≠ New constitutional fact ` 
unless a separate constitutional mechanism establishes such a transition.
  
# 17. Judgment Provenance
 
If D5 concludes that Domain Judgment is required, it must determine whether every judgment contains:
 `Profile identity Profile version Input identity Input evidence references Projection/derivation identity Policy context Context Result Reason Provenance ` 
This is not a proposed final schema.
 
It is the interrogation checklist for D5.
 
The key invariant is:
 
 
A downstream conclusion must remain reconstructable from upstream constitutional inputs.
 
 
This directly aligns with SIOS's reconstructability principle.
  
# 18. Profile Composition Algebra
 
D5 must determine whether Profile composition is:
 
### Union
 `P(A) ∪ P(B) ` 
### Intersection
 `P(A) ∩ P(B) ` 
### Ordered composition
 `P(A) → P(B) ` 
### Contextual selection
 `Context → P(A) or P(B) ` 
### Independent parallel projections
 `Reality  ├── P(A)  └── P(B) ` 
### Federated composition
 `P(A)  ├── owns vocabulary A  └── delegates certain questions to P(B) ` 
The architecture must not assume that “composition” means dependency.
  
# 19. Profile Conflict
 
D5 must define what happens when two Profiles make incompatible claims.
 
Example:
 `Profile A:     state = "active"  Profile B:     state = "recalled" ` 
Possible explanations include:
 
 
- different temporal contexts;
 
- different jurisdictions;
 
- different semantic vocabularies;
 
- different evidence;
 
- actual contradiction;
 
- different projections of the same Reality.
 

 
Therefore D5 must not resolve conflict by simple priority.
 
The investigation must determine:
 
 
**Is Profile conflict a semantic contradiction, a contextual distinction, or evidence of incompatible Reality?**
 
  
# 20. Context
 
D5 must explicitly investigate Context.
 
The same Reality may produce different valid interpretations based on:
 `jurisdiction time actor purpose regulatory regime application available evidence ` 
Therefore:
 `Profile + Reality ` 
may be insufficient.
 
The real model may be:
 `Profile + Reality + Context + Evidence + Authorization ` 
D5 must determine which of these are constitutional inputs and which belong to application orchestration.
  
# 21. Temporal Composition
 
ZRM-003B establishes constitutional logical time independently of physical clocks.
 
It defines:
 
 
- ordering;
 
- concurrency;
 
- partial ordering;
 
- temporal topology;
 
- temporal irreversibility.
 

 
Therefore D5 must not assume that Profile evaluation is simply:
 `current timestamp → current profile state ` 
It must investigate whether Profile interrogation is evaluated against:
 `logical state at t ` 
or:
 `event interval ` 
or:
 `contextual temporal slice ` 
or another established temporal construct.
  
# 22. Profile Version vs Reality Version
 
D5 must distinguish:
 `Reality version Profile version Projection version Policy version Evidence version Execution version ` 
A Profile change must not imply that Reality changed.
 
For example:
 `Reality R1 Profile P1 → interpretation A  same Reality R1 Profile P2 → interpretation B ` 
may be perfectly legitimate.
 
Therefore:
 
 
**Profile evolution is not Reality evolution.**
 
  
# 23. Profile Isolation Stress Test
 
Every proposed composition model must pass:
 
### Test P1 — Product + Location
 
Can a Product Profile and Location Profile coexist without one importing the other's ontology?
 
### Test P2 — Product + DPP
 
Can DPP requirements be added without redefining Product Reality?
 
### Test P3 — Product + Customs
 
Can Customs interpret the same Product without becoming the Product Profile?
 
### Test P4 — Product + Logistics
 
Can Logistics use Product information without creating Product→Logistics Profile dependency?
 
### Test P5 — Product + Healthcare
 
Can regulated healthcare semantics specialize the same underlying Reality without contaminating the generic Product Profile?
 
### Test P6 — Vehicle + Logistics + Customs
 
Can three domains interpret the same Vehicle independently?
 
### Test P7 — Document + Legal + Finance
 
Can the same Document participate in different domain interpretations?
 
### Test P8 — Person + Healthcare + Legal
 
Can highly contextual interpretations coexist without creating a universal Person ontology?
  
# 24. The “Hundreds of Profiles” Stress Test
 
D5 must explicitly address the strategic scaling problem.
 
Suppose Zyppi eventually supports:
 `100 asset classes × 100 domains × 100 regulatory contexts × 100 projection types ` 
A naive architecture could produce:
 `1,000,000 profiles ` 
That is unacceptable as a constitutional design assumption.
 
Therefore D5 must investigate whether the architecture should factor the dimensions:
 `Asset Profile         × Domain Vocabulary         × Projection         × Context         × Policy ` 
rather than produce one Profile for every combination.
 
This may be the most important D5 architectural question.
  
# 25. Candidate Factorized Model
 
One candidate is:
 `                 Asset Reality                       │                       ▼                  Asset Profile                       │              ┌────────┴────────┐              │                 │        Domain Semantic     Projection           Layer              Layer              │                 │              └────────┬────────┘                       │                    Context                       │                       ▼                  Interpretation                       │                       ▼                   Judgment ` 
Under this model:
 
 
- Product is not a GS1 Profile;
 
- GS1 is not a Product Profile;
 
- DPP is not a Product Profile;
 
- Customs is not a Product Profile;
 
- Logistics is not a Product Profile.
 

 
Instead they become orthogonal semantic/projection capabilities.
 
This is only a candidate and requires D1/D5 validation.
  
# 26. Profile as “What This Reality Is”
 
D5 should test the possibility that ARM Profile has a narrow semantic role:
 
 
**Profile describes the class of participation an Asset Reality belongs to.**
 
 
For example:
 `Asset Reality     ↓ Product Profile ` 
while:
 `GS1 DPP Customs Logistics Healthcare ` 
describe what different systems want to know about that Product.
 
This distinction would dramatically reduce Profile explosion.
  
# 27. Domain Layer as “What This Reality Means Here”
 
A separate semantic layer could then answer:
 `Product     + Customs context     ↓ Customs interpretation ` 
or:
 `Product     + DPP context     ↓ DPP projection ` 
or:
 `Product     + Logistics context     ↓ Logistics interpretation ` 
D5 must determine whether this is better represented by:
 
 
- Translation Layers;
 
- Semantic Projections;
 
- Intelligence;
 
- Projection specifications;
 
- or a new Z-PROF construct.
 

  
# 28. Relationship to SIOS Translation Layers
 
SIOS explicitly assigns Translation Layers the responsibility of translating domain-specific language into constitutional concepts.
 
This creates a major D5 question:
 
 
**Is Z-PROF actually a new Translation Layer architecture, or is it the execution/registry substrate that allows Translation Layers to become computationally active?**
 
 
If the latter:
 `SIOS Translation Layer         │         ▼ Z-PROF machinery         │         ▼ Existing ZRM / RI / POL / SEC ` 
may be more accurate than:
 `Z-PROF    = Translation Layer ` 
D5 must resolve this.
  
# 29. Relationship to ZRM-005
 
ZRM-005 already defines Semantic Projection as a mathematical/constitutional operation.
 
Therefore D5 must not redefine Projection.
 
Instead it must ask:
 
 
What does a Profile provide to a Semantic Projection?
 
 
Possible answer:
 `Profile  ├── identifies allowed semantic vocabulary  ├── identifies supported projection families  ├── identifies required inputs  └── constrains derivation ` 
But this remains a hypothesis.
 
ZRM-005 is currently Draft — Council Review, so its authority status must also be respected.
  
# 30. Relationship to ARM-001
 
D5 must treat ARM-001 as particularly important because it is already:
 
 
- RATIFIED;
 
- LOCKED;
 
- ACTIVE.
 

 
ARM-001 explicitly says:
 
 
Profiles are independent specializations and must not modify the core.
 
 
It also explicitly states that profile declaration controls whether a projection may be generated.
 
Therefore any Z-PROF proposal that makes Profile more powerful than this must be treated as a constitutional conflict, not an architectural refinement.
  
# 31. Interrogation Ownership
 
D5 shall investigate three candidate owners.
 
### Model A — Profile owns interrogation
 `Profile    ↓ Requirements ` 
### Model B — Projection owns interrogation
 `Projection    ↓ Required inputs ` 
### Model C — Separate Interrogation Contract
 `Profile    + Projection    + Context         ↓ Interrogation Contract ` 
Model C is potentially the most scalable, but must not be selected merely because it looks elegant.
  
# 32. Interrogation and Authorization
 
D5 must preserve:
 `"What information is required?" ` 
from:
 `"Is this subject permitted to access it?" ` 
The first is semantic interrogation.
 
The second is authorization.
 
They must remain separate.
 
A Profile may declare:
 `requires:     Certification Evidence ` 
but it must not itself decide:
 `Subject X is authorized to read Certification Evidence. ` 
That remains within the appropriate policy/security boundary.
  
# 33. Interrogation and Evidence
 
A Profile may need evidence.
 
But D5 must determine whether it:
 `declares required evidence types ` 
or:
 `selects specific evidence records ` 
or:
 `requests evidence retrieval ` 
These are different levels of authority.
 
Candidate hierarchy:
 `Profile:     declares need  Application:     resolves references  Evidence Engine:     retrieves / verifies  Runtime:     consumes verified evidence  Profile:     interprets result ` 
This model aligns with the existing M07 evidence composition boundary, where Registry references resolve into EvidenceBundle and payloads are verified before Runtime execution.
  
# 34. Interrogation Failure
 
D5 must define semantic failure classes.
 
Possible states:
 `SATISFIED PARTIALLY_SATISFIED UNAVAILABLE UNAUTHORIZED AMBIGUOUS CONTRADICTORY UNVERIFIED OUT_OF_SCOPE ` 
These are candidate categories only.
 
The final vocabulary must trace to existing constitutional contracts where possible.
  
# 35. No Silent Completion
 
If required information is absent:
 
 
the Profile must not silently infer it.
 
 
This follows the broader Zyppi evidence discipline and ZRM-005's No-New-Facts rule.
 
Therefore:
 `missing evidence       ≠ negative evidence ` 
and:
 `unknown       ≠ false ` 
unless a governing domain contract explicitly establishes such semantics.
  
# 36. Composition of Results
 
D5 must investigate whether composed Profiles produce:
 
### Option A
 
One merged result:
 `P1 + P2 → Result ` 
### Option B
 
Independent results:
 `P1 → Result1 P2 → Result2 ` 
### Option C
 
A result set:
 `{Result1, Result2, ...} ` 
### Option D
 
A composed interpretation:
 `P1 → semantic facts P2 → semantic facts         ↓ composition layer         ↓ combined judgment ` 
Option D is powerful but creates a new authority boundary and therefore requires careful D1 review.
  
# 37. Composition Must Preserve Provenance
 
For any composed result:
 `Result(P1,P2) ` 
the system must be able to determine:
 `which part came from P1 which part came from P2 which evidence supported each part which context applied which rules produced each conclusion ` 
Otherwise composition destroys reconstructability.
 
This is incompatible with SIOS's reconstructability principle.
  
# 38. Profile Conflict Resolution
 
D5 must investigate the following precedence possibilities:
 `No precedence       │       ├── contextual separation       ├── temporal separation       ├── jurisdiction separation       └── actual contradiction ` 
D5 should **not** introduce:
 `Profile A > Profile B ` 
as the default solution.
 
Constitutional authority cannot be created merely by assigning Profile priority.
  
# 39. Profile Lifecycle
 
D5 must determine whether Profile lifecycle follows existing constitutional lifecycle semantics.
 
Candidate states:
 `Draft Review Active Deprecated Retired Revoked ` 
However, existing lifecycle semantics must be reused where applicable rather than duplicated.
 
The question is:
 
 
Is a Profile an ordinary governed artifact under existing governance, or does it require a specialized lifecycle?
 
  
# 40. Profile Identity
 
D5 must distinguish:
 `Profile Identity ` 
from:
 `Asset Identity ` 
and:
 `Projection Identity ` 
A Profile identifier identifies the **definition**, not the Asset.
 
Example:
 `ARM-P-001 ` 
does not identify a particular Product.
 
This follows the broader Zyppi separation between identity and representation.
  
# 41. Profile Versioning
 
A Profile version must be independently addressable.
 
Potential identity:
 `Profile:     product Version:     1.2 ` 
A change from:
 `Product Profile v1 ` 
to:
 `Product Profile v2 ` 
must not retroactively alter prior interpretations.
 
D5 must investigate whether historical Profile versions are immutable and replayable.
  
# 42. Deterministic Replay
 
A Profile evaluation should be replayable if it is intended to be constitutional or cryptographically auditable.
 
Candidate replay tuple:
 `Profile Version + Profile Inputs + Evidence + Context + Execution Result ` 
must produce the same result.
 
However, D5 must determine whether Profile evaluation itself belongs inside the existing M08 replay model or has a distinct replay domain.
 
This is intentionally left unresolved for D3.
  
# 43. AI and Probabilistic Reasoning
 
D5 must explicitly distinguish:
 `Profile declaration ` 
from:
 `AI reasoning ` 
A Profile must not silently become an AI agent.
 
If an AI system contributes an interpretation:
 `AI output ` 
must not automatically become:
 `constitutional fact ` 
The relevant question is whether the AI output becomes:
 
 
- evidence;
 
- intelligence;
 
- an externally supplied input;
 
- a deterministic artifact;
 
- or an application-level interpretation.
 

 
This belongs jointly to D1/D3.
  
# 44. The Profile Composition Stress Model
 
D5 shall eventually test the following matrix:
 
  
 
Asset
 
Domain
 
Projection
 
Context
 
Expected Behavior
 
   
 
Product
 
GS1
 
Digital Link
 
Global
 
Project
 
 
 
Product
 
DPP
 
Passport
 
EU
 
Project
 
 
 
Product
 
Customs
 
Declaration
 
Egypt/EU
 
Interpret
 
 
 
Product
 
Logistics
 
Shipment
 
Carrier
 
Interpret
 
 
 
Product
 
Healthcare
 
Regulated product
 
Healthcare jurisdiction
 
Interpret
 
 
 
Vehicle
 
Logistics
 
Fleet
 
Carrier
 
Interpret
 
 
 
Vehicle
 
Customs
 
Import
 
Jurisdiction
 
Interpret
 
 
 
Document
 
Legal
 
Contract
 
Jurisdiction
 
Interpret
 
 
 
Document
 
Finance
 
Financial record
 
Institution
 
Interpret
 
 
 
Person
 
Healthcare
 
Credential
 
Regulated context
 
Interpret
 
 
 
Person
 
Legal
 
Identity evidence
 
Jurisdiction
 
Interpret
 
 
 
Place
 
Logistics
 
Location
 
Carrier
 
Project
 
 
 
Place
 
Customs
 
Border facility
 
Jurisdiction
 
Interpret
 
  
 
The objective is not to implement these domains.
 
The objective is to determine whether the Profile architecture remains coherent when domains multiply.
  
# 45. D5 Preliminary Hypothesis
 
D5 currently identifies a strong architectural possibility:
 `                ASSET REALITY                       │                       ▼                 ARM PROFILE              "What is this class?"                       │                       ▼             DOMAIN / SEMANTIC LAYER           "What does it mean here?"                       │           ┌───────────┴───────────┐           ▼                       ▼      PROJECTION              INTERROGATION    "How express it?"       "What must I know?"           │                       │           └───────────┬───────────┘                       ▼                   CONTEXT                       │                       ▼                 INTERPRETATION                       │                       ▼                   JUDGMENT* ` 
`*` Whether Judgment exists as a first-class artifact is unresolved.
 
This model has one major advantage:
 
 
It prevents the existing ARM Profile concept from becoming overloaded with every domain, projection, interrogation, and reasoning concern.
 
 
But it remains a **D5 hypothesis, not a decision**.
  
# 46. D5 Findings to Date
 
### F-D5-01 — Profile Collision
 
A constitutional Profile concept already exists in ARM-001.
 
**Status:** `CONFIRMED`
  
### F-D5-02 — Profile Has Existing Narrower Meaning
 
ARM-001 Profiles are asset-class specializations with projection declarations and state vocabulary.
 
**Status:** `CONFIRMED`
  
### F-D5-03 — Semantic Projection Already Exists
 
ZRM-005 already defines Semantic Projection.
 
**Status:** `CONFIRMED — BUT ZRM-005 IS DRAFT`
  
### F-D5-04 — Translation Layer Already Exists Conceptually
 
SIOS assigns Translation Layers the responsibility of translating domain language into constitutional concepts.
 
**Status:** `CONFIRMED`
  
### F-D5-05 — Intelligence Already Owns Interpretation
 
ARM-001 explicitly places interpretation such as trust, risk, pattern detection, and supply-chain intelligence within Intelligence.
 
**Status:** `CONFIRMED`
  
### F-D5-06 — Profile Explosion Is Avoidable in Principle
 
ARM Profiles need not necessarily encode every domain/projection/context combination.
 
**Status:** `HYPOTHESIS — REQUIRES STRESS TEST`
  
### F-D5-07 — Interrogation Is Not Infrastructure Access
 
Interrogation should describe semantic requirements rather than directly access Registry, database, or evidence infrastructure.
 
**Status:** `STRONG ARCHITECTURAL CONSTRAINT`
  
### F-D5-08 — Domain Judgment Is Not Yet Established
 
No existing evidence establishes `DomainJudgment` as a constitutional primitive or required first-class artifact.
 
**Status:** `OPEN`
  
### F-D5-09 — Profile Composition Is Not Yet Defined
 
No existing governing artifact establishes a general algebra for composing multiple Profiles.
 
**Status:** `OPEN`
  
### F-D5-10 — Z-PROF May Be an Architecture Rather Than a New Constitutional Object
 
The existing substrate may already contain the semantic concepts required, with Z-PROF providing governed composition/interrogation rather than inventing a new ontology.
 
**Status:** `HIGH-VALUE HYPOTHESIS`
  
# 47. D5 Decision Questions
 
D5 shall ultimately present the Council with explicit decisions on:
 
### Q1 — Profile Identity
 
Is Z-PROF's “Profile” the same constitutional object as ARM-P-NNN?
 
### Q2 — Profile Scope
 
Does an ARM Profile describe only an Asset Class, or may it also contain domain semantics?
 
### Q3 — Domain Semantics
 
Where does domain-specific semantic vocabulary live?
 
### Q4 — Projection
 
Does Z-PROF own projection, or consume ZRM/PRJ projection mechanisms?
 
### Q5 — Translation
 
Is Z-PROF a Translation Layer, a Translation execution substrate, or neither?
 
### Q6 — Interrogation
 
Is Interrogation a first-class governed construct?
 
### Q7 — Interrogation Ownership
 
Does Profile, Projection, Context, or a separate contract declare data requirements?
 
### Q8 — Judgment
 
Is Domain Judgment a first-class artifact?
 
### Q9 — Intelligence
 
Are domain judgments specialized Intelligence?
 
### Q10 — Composition
 
Can multiple Profiles coexist for one Asset Reality?
 
### Q11 — Isolation
 
If Profiles compose, how is ARM-001 Profile Isolation preserved?
 
### Q12 — Context
 
Is Context an independent dimension of composition?
 
### Q13 — Versioning
 
How are Profile versions bound to interpretations?
 
### Q14 — Replay
 
What exact inputs constitute a replayable Profile evaluation?
 
### Q15 — Conflict
 
How are incompatible Profile outputs classified?
 
### Q16 — Scale
 
How does the architecture support hundreds of domains without producing combinatorial Profile explosion?
 
### Q17 — AI
 
Can probabilistic intelligence participate in a Profile evaluation, and if so, what constitutional status does its output have?
  
# 48. D5 Non-Decisions
 
This document intentionally does **not** decide:
 
 
- Profile DSL;
 
- JSON Schema;
 
- SHACL;
 
- graph technology;
 
- WASM;
 
- OPA;
 
- TypeScript evaluator;
 
- plugin system;
 
- registry implementation;
 
- Profile package location;
 
- API contract;
 
- database schema;
 
- cryptographic signing scheme;
 
- DomainJudgment schema;
 
- Profile Brain implementation.
 

 
Those belong to D3 or later implementation governance after D5 semantic closure.
  
# 49. D5 Required Deliverable
 
The next D5 round shall produce a **Profile Composition Model** containing:
 
 
1. canonical Profile definition;
 
2. relationship between ARM Profile and Z-PROF;
 
3. Profile dimensions;
 
4. composition model;
 
5. interrogation model;
 
6. projection relationship;
 
7. translation relationship;
 
8. intelligence relationship;
 
9. context model;
 
10. judgment model;
 
11. conflict model;
 
12. lifecycle/version model;
 
13. replay model;
 
14. jurisdiction model;
 
15. scaling model.
 

 
Only after this model is accepted should D3 compare implementation architectures.
  
# 50. D5 Gate
 
D5 shall be considered semantically mature only when the Council can answer:
 
 
**If Zyppi has 100 Asset Profiles, 500 domains, 1,000 projections, and thousands of jurisdictional contexts, can the architecture represent all of them without creating a new Profile for every combination?**
 
 
If the answer is no, D5 is not complete.
 
If the answer is yes, D5 must demonstrate **how composition avoids combinatorial explosion without violating ARM-001 Profile Isolation.**
  
# 51. Preliminary Council Position
 
D5-R1 proposes the following investigation posture:
 
 
**Do not create a second generic “Profile” concept until the existing ARM Profile architecture has been proven insufficient.**
 
 
The current corpus suggests that Zyppi already separates:
 `Reality    ↓ ARM Profile    ↓ Semantic Projection    ↓ Translation / Intelligence    ↓ Projection / Experience ` 
with different constitutional responsibilities.
 
The most important possibility now under investigation is therefore:
 
 
**Z-PROF may not need to invent a new Profile ontology. It may need to define the governed composition and interrogation architecture that allows existing Profile, Projection, Translation, Intelligence, Policy, Security, and Runtime systems to work together across domains.**
 
 
This is the central hypothesis D5-R2 must falsify or validate.
  
# 52. Status
 
**D5-R1:** `OPEN — INVESTIGATION INITIATED`
 
**No implementation authority granted.**
 
**No new Profile construct ratified.**
 
**No `DomainJudgment` construct ratified.**
 
**No Interrogation DSL ratified.**
 
**No Profile Registry modification authorized.**
 
**Next required step:** `D5-R2 — Profile Composition Model & Interrogation Algebra`.