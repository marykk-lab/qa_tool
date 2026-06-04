/**
 * TDD RED: Tests for wizard-config helpers (hasDetailStep, getTotalSteps)
 *
 * Describes expected behavior per Task 4 <behavior> block:
 * - hasDetailStep returns false when modules empty or projectType null
 * - hasDetailStep returns true for ecommerce when checkout/auth/search selected
 * - hasDetailStep returns false when only non-detail modules selected
 * - hasDetailStep returns true for infosite when contact-form/multilang selected
 * - getTotalSteps returns 3 when no detail-triggering module selected
 * - getTotalSteps returns 4 when one detail-triggering module is selected
 */

import { getTotalSteps, hasDetailStep } from "../constants/wizard-config";
import { INITIAL_WIZARD_STATE } from "../lib/types";

describe("hasDetailStep", () => {
  it("returns false when modules array is empty", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce" })).toBe(false);
  });

  it("returns false when projectType is null", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, modules: ["checkout"] })).toBe(false);
  });

  it("returns true for ecommerce when checkout is selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["checkout"] })).toBe(true);
  });

  it("returns true for ecommerce when auth is selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["auth"] })).toBe(true);
  });

  it("returns true for ecommerce when search is selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["search"] })).toBe(true);
  });

  it("returns false for ecommerce when only non-detail modules selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["catalog", "cart"] })).toBe(false);
  });

  it("returns true for infosite when contact-form is selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "infosite", modules: ["contact-form"] })).toBe(true);
  });

  it("returns true for infosite when multilang is selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "infosite", modules: ["multilang"] })).toBe(true);
  });

  it("returns false for infosite when only non-detail modules selected", () => {
    expect(hasDetailStep({ ...INITIAL_WIZARD_STATE, projectType: "infosite", modules: ["blog", "gallery"] })).toBe(false);
  });
});

describe("getTotalSteps", () => {
  it("returns 3 when no detail-triggering modules selected", () => {
    expect(getTotalSteps({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["catalog"] })).toBe(3);
  });

  it("returns 4 when a detail-triggering module is selected", () => {
    expect(getTotalSteps({ ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["checkout"] })).toBe(4);
  });

  it("returns 3 when projectType is null (no detail step)", () => {
    expect(getTotalSteps(INITIAL_WIZARD_STATE)).toBe(3);
  });
});
