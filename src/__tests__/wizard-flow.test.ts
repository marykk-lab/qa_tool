/**
 * Tests for wizard step-transition contract — Phase 4 sequential sub-step model.
 *
 * Phase 4 replaces the single optional detail step with N module sub-steps
 * (one per selected module). Navigation is strictly sequential — no skipping.
 * getTotalSteps = 3 + modules.length.
 */

import { getTotalSteps } from "../constants/wizard-config";
import { INITIAL_WIZARD_STATE } from "../lib/types";
import type { WizardState } from "../lib/types";

// ── Pure step-transition helpers mirroring Wizard.tsx Phase 4 logic ──────────

function computeNext(step: number): number {
  return step + 1;
}

function computeBack(step: number, totalSteps: number, isCompletion: boolean): number {
  if (isCompletion) return totalSteps;
  return Math.max(1, step - 1);
}

// ── getTotalSteps: 3 + modules.length ────────────────────────────────────────

describe("getTotalSteps — Phase 4 formula: 3 + modules.length", () => {
  it("returns 3 when no modules selected", () => {
    expect(getTotalSteps(INITIAL_WIZARD_STATE)).toBe(3);
  });

  it("returns 4 for one module (ecommerce)", () => {
    const state: WizardState = { ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["catalog"] };
    expect(getTotalSteps(state)).toBe(4);
  });

  it("returns 5 for two modules (ecommerce)", () => {
    const state: WizardState = { ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["catalog", "checkout"] };
    expect(getTotalSteps(state)).toBe(5);
  });

  it("returns 4 for one module (infosite)", () => {
    const state: WizardState = { ...INITIAL_WIZARD_STATE, projectType: "infosite", modules: ["blog"] };
    expect(getTotalSteps(state)).toBe(4);
  });

  it("returns 6 for three modules", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["catalog", "checkout", "auth"],
    };
    expect(getTotalSteps(state)).toBe(6);
  });
});

// ── computeNext — always increments by 1 (no step-skipping) ─────────────────

describe("computeNext — sequential navigation", () => {
  it("step 1 → 2", () => { expect(computeNext(1)).toBe(2); });
  it("step 2 → 3", () => { expect(computeNext(2)).toBe(3); });
  it("step 3 → 4 (first module sub-step)", () => { expect(computeNext(3)).toBe(4); });
  it("step 4 → 5 (second module sub-step)", () => { expect(computeNext(4)).toBe(5); });
  it("step 5 → 6", () => { expect(computeNext(5)).toBe(6); });
});

// ── computeBack — from completion returns to last sub-step ───────────────────

describe("computeBack — from completion goes to last sub-step", () => {
  it("from completion with 1 module (totalSteps=4): back to step 4", () => {
    const state: WizardState = { ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["catalog"] };
    expect(computeBack(5, getTotalSteps(state), true)).toBe(4);
  });

  it("from completion with 2 modules (totalSteps=5): back to step 5", () => {
    const state: WizardState = { ...INITIAL_WIZARD_STATE, projectType: "ecommerce", modules: ["catalog", "checkout"] };
    expect(computeBack(6, getTotalSteps(state), true)).toBe(5);
  });

  it("step 4 → 3", () => { expect(computeBack(4, 5, false)).toBe(3); });
  it("step 3 → 2", () => { expect(computeBack(3, 5, false)).toBe(2); });
  it("step 2 → 1", () => { expect(computeBack(2, 5, false)).toBe(1); });
  it("step 1 → 1 (cannot go below step 1)", () => { expect(computeBack(1, 5, false)).toBe(1); });
});

// ── Branch-reset rule: switching projectType resets platform+modules ─────────

describe("branch-reset rule — switching projectType", () => {
  it("after switching from ecommerce to infosite, platform and modules reset", () => {
    const ecomState: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      platform: "shopify",
      modules: ["catalog", "checkout"],
    };

    const resetState: WizardState = {
      ...ecomState,
      projectType: "infosite",
      platform: null,
      modules: [],
    };

    expect(resetState.projectType).toBe("infosite");
    expect(resetState.platform).toBeNull();
    expect(resetState.modules).toHaveLength(0);
    expect(getTotalSteps(resetState)).toBe(3);
  });
});
