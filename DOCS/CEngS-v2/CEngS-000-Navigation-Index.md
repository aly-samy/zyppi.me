# CEngS-000 — Engineering Navigation Index

**Version 2.0 · Status: RATIFIED · Supersedes CEngS-001–010 (v1.0 Draft), CES-005**

## Purpose

This is the only document every AI agent reads first. It defines no rules itself — it tells you which of the other documents to load for the task in front of you, in what order, and when to stop reading.

## Corpus Map

```
CORE (always load, every session — ~3 short documents)
├── CEngS-001  Engineering Constitution   (immutable law — what must always be true)
├── CEngS-002  Engineering Rules          (repo structure, boundaries, dependencies)
└── CEngS-003  AI Engineering Mandate     (how an AI agent operates: authority, task
                                            decomposition, context loading)

OPERATIONAL STANDARDS (load only the one relevant to the task)
├── CEngS-101  Testing & Verification Standard
├── CEngS-102  Review, CI/CD & Release Standard
├── CEngS-103  Performance & Benchmark Standard
├── CEngS-104  Observability & Operational Evidence Standard
└── CEngS-105  Documentation Standard

CHECKLISTS (load right before producing a deliverable)
├── CL-001  AI Coding / PR Checklist
└── CL-002  Release Checklist

IMPLEMENTATION GUIDES (product-specific — outside CEngS, load per feature area)
└── IG-xxx  e.g. IG-001 Commerce Atlas, IG-002 Runtime, IG-003 Identity Engine...
```

## Loading Algorithm

1. Load CEngS-001, CEngS-002, CEngS-003. Always. Every session. Nothing else is loaded by default.
2. Identify the task category from the table below.
3. Load only the Operational Standard(s) listed for that category.
4. Load the relevant Implementation Guide(s), if the task touches a specific product area.
5. Load the matching Checklist immediately before producing a deliverable (code, PR, release).
6. Do not load anything not listed here for the task at hand. If you believe you need something not listed, stop and say so rather than guessing.

## Task → Document Table

| Task                                        | Load (in addition to Core)             |
| ------------------------------------------- | -------------------------------------- |
| Any general coding task                     | Core only                              |
| Profile / Domain Architecture (M08.5)       | Core + CAW-005, M08.5-PREP, M08.5-PLAN |
| Writing or modifying tests                  | CEngS-101                              |
| Opening a Pull Request                      | CEngS-102, CL-001                      |
| Cutting a build or release                  | CEngS-102, CL-002                      |
| Optimization / profiling work               | CEngS-103                              |
| Adding logs, metrics, traces, alerts        | CEngS-104                              |
| Writing docs / READMEs / API references     | CEngS-105                              |
| Implementing a specific product area        | Core + relevant IG-xxx                 |
| Reviewing someone else's (or AI's) PR       | CEngS-102, CL-001                      |
| Deciding whether to migrate a package to Go | CEngS-103 §Migration Triggers          |

## Governing Principle

Core is law. Operational Standards are procedure and may evolve. Implementation Guides are product knowledge, not constitutional. Checklists are not documents to reason about — they are documents to tick.

If a rule appears in two places in this corpus, that is a defect: file it, don't duplicate around it. Every rule below has exactly one home.
