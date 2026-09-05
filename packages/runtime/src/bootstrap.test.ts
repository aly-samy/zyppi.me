import { describe, it, expect } from "vitest";
import * as runtime from "./index.js";

describe("Runtime Package Bootstrap", () => {
  it("imports successfully and exposes intended public V2 capability", () => {
    expect({ ...runtime }).toEqual({
      validateExecutionEnvelopeCompatibilityV2: expect.any(Function),
    });
  });
});
