# CEngS-105 — Documentation Standard

**Version 2.0 · Status: RATIFIED · Authority: Operational Standard · Depends On: CEngS-001, CEngS-002**
**Supersedes: documentation clauses previously duplicated across legacy CEngS-001/002/003/004**

## 1. Purpose

Every public package and API documents itself well enough that a new engineer — human or AI — can use it correctly without reading the source. Documentation evolves with the implementation; it is never allowed to fall behind it.

## 2. Package Documentation

Every public package includes: Purpose, Architecture, Public API, Examples, Dependencies, Limitations.

## 3. Public API Documentation

Every public function/endpoint includes: Purpose, Parameters, Return values, Errors, Examples, and version history where the API has changed.

## 4. Required at PR Time

Any PR that adds or changes public behavior updates: the package doc, the API doc, and — for breaking changes — migration notes. A PR that changes behavior without a corresponding doc update fails review (CEngS-102 §4).

## 5. Compliance

Documentation completeness is checked as part of the standard review gate (CEngS-102). It is not a separate approval step.
