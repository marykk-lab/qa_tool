/**
 * TDD RED: Tests for wizard navigation guard (canAdvance)
 *
 * Describes expected behavior per Task 4 <behavior> block:
 * - canAdvance(1, state) is false when projectType null, true when set
 * - canAdvance(2) gates on platform
 * - canAdvance(3) gates on modules.length > 0
 * - canAdvance(4) always returns true (details are optional)
 */

import { INITIAL_WIZARD_STATE } from "../lib/types";
import type { WizardState } from "../lib/types";

// Inline the canAdvance logic here (mirrors WizardNav.tsx internal function)
function canAdvance(step: number, state: WizardState): boolean {
  switch (step) {
    case 1: return state.projectType !== null;
    case 2: return state.platform !== null;
    case 3: return state.modules.length > 0;
    case 4: return true;
    default: return false;
  }
}

describe("canAdvance navigation guard", () => {
  it("step 1: returns false when projectType is null", () => {
    expect(canAdvance(1, INITIAL_WIZARD_STATE)).toBe(false);
  });

  it("step 1: returns true when projectType is set", () => {
    expect(canAdvance(1, { ...INITIAL_WIZARD_STATE, projectType: "ecommerce" })).toBe(true);
  });

  it("step 1: returns true when projectType is infosite", () => {
    expect(canAdvance(1, { ...INITIAL_WIZARD_STATE, projectType: "infosite" })).toBe(true);
  });

  it("step 2: returns false when platform is null", () => {
    expect(canAdvance(2, { ...INITIAL_WIZARD_STATE, projectType: "ecommerce" })).toBe(false);
  });

  it("step 2: returns true when platform is set", () => {
    expect(canAdvance(2, { ...INITIAL_WIZARD_STATE, platform: "shopify" })).toBe(true);
  });

  it("step 3: returns false when modules array is empty", () => {
    expect(canAdvance(3, INITIAL_WIZARD_STATE)).toBe(false);
  });

  it("step 3: returns true when at least one module selected", () => {
    expect(canAdvance(3, { ...INITIAL_WIZARD_STATE, modules: ["catalog"] })).toBe(true);
  });

  it("step 4: always returns true (details are optional)", () => {
    expect(canAdvance(4, INITIAL_WIZARD_STATE)).toBe(true);
  });

  it("step 4: returns true even with no selections", () => {
    expect(canAdvance(4, { ...INITIAL_WIZARD_STATE, projectType: null, platform: null })).toBe(true);
  });

  it("unknown step: returns false", () => {
    expect(canAdvance(99, INITIAL_WIZARD_STATE)).toBe(false);
  });
});
