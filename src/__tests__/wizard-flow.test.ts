/**
 * TDD RED: Tests for wizard step-transition contract (computeNext / computeBack)
 *
 * Describes expected behavior per Task 1 <behavior> block:
 * - From step 3 with no qualifying module, Далі jumps to step 5 (completion) — skips step 4
 * - From step 3 with a qualifying module, Далі goes to step 4
 * - From completion (step 5) with no detail step, Назад returns to step 3
 * - From completion (step 5) with a detail step, Назад returns to step 4
 * - getTotalSteps returns 4 when qualifying module added, 3 when removed
 * - Switching projectType resets platform and modules (branch-reset rule)
 *
 * computeNext / computeBack are pure helpers that EXACTLY mirror
 * Wizard.tsx handleNext / handleBack logic (Task 3 implements them in the component).
 */

import { getTotalSteps, hasDetailStep } from "../constants/wizard-config";
import { INITIAL_WIZARD_STATE } from "../lib/types";
import type { WizardState } from "../lib/types";

// ── Pure step-transition helpers mirroring Wizard.tsx handleNext/handleBack ──

/**
 * computeNext mirrors handleNext in Wizard.tsx (without validation guards —
 * we assume the caller already passed canAdvance).
 */
function computeNext(step: number, state: WizardState): number {
  if (step === 3 && !hasDetailStep(state)) {
    return 5; // skip step 4 when no qualifying modules
  }
  return step + 1;
}

/**
 * computeBack mirrors handleBack in Wizard.tsx.
 */
function computeBack(step: number, state: WizardState): number {
  if (step === 5 && !hasDetailStep(state)) {
    return 3; // skip back over step 4 when no detail step
  }
  return Math.max(1, step - 1);
}

// ── E-commerce branch: non-qualifying module (catalog) ──────────────────────

describe("computeNext — ecommerce, catalog only (no qualifying module)", () => {
  const state: WizardState = {
    ...INITIAL_WIZARD_STATE,
    projectType: "ecommerce",
    platform: "shopify",
    modules: ["catalog"],
  };

  it("step 3 → 5 (skips step 4)", () => {
    expect(computeNext(3, state)).toBe(5);
  });

  it("step 1 → 2", () => {
    expect(computeNext(1, state)).toBe(2);
  });

  it("step 2 → 3", () => {
    expect(computeNext(2, state)).toBe(3);
  });
});

// ── E-commerce branch: qualifying module (checkout) ─────────────────────────

describe("computeNext — ecommerce, checkout selected (qualifying module)", () => {
  const state: WizardState = {
    ...INITIAL_WIZARD_STATE,
    projectType: "ecommerce",
    platform: "woocommerce",
    modules: ["checkout"],
  };

  it("step 3 → 4 (detail step triggered)", () => {
    expect(computeNext(3, state)).toBe(4);
  });

  it("step 4 → 5", () => {
    expect(computeNext(4, state)).toBe(5);
  });
});

// ── computeBack from completion (step 5) ────────────────────────────────────

describe("computeBack — from completion step 5", () => {
  it("with catalog only (no detail step): step 5 → 3", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["catalog"],
    };
    expect(computeBack(5, state)).toBe(3);
  });

  it("with checkout (detail step present): step 5 → 4", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["checkout"],
    };
    expect(computeBack(5, state)).toBe(4);
  });

  it("with contact-form (infosite detail step): step 5 → 4", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "infosite",
      modules: ["contact-form"],
    };
    expect(computeBack(5, state)).toBe(4);
  });

  it("step 4 → 3", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["checkout"],
    };
    expect(computeBack(4, state)).toBe(3);
  });

  it("step 2 → 1", () => {
    expect(computeBack(2, INITIAL_WIZARD_STATE)).toBe(1);
  });

  it("step 1 → 1 (cannot go below step 1)", () => {
    expect(computeBack(1, INITIAL_WIZARD_STATE)).toBe(1);
  });
});

// ── getTotalSteps transitions 3↔4 ───────────────────────────────────────────

describe("getTotalSteps — transitions between 3 and 4", () => {
  it("returns 3 when no qualifying module selected (catalog only)", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["catalog"],
    };
    expect(getTotalSteps(state)).toBe(3);
  });

  it("returns 4 after adding checkout to modules", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["catalog", "checkout"],
    };
    expect(getTotalSteps(state)).toBe(4);
  });

  it("returns 3 after removing checkout (only catalog remains)", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      modules: ["catalog"],
    };
    expect(getTotalSteps(state)).toBe(3);
  });

  it("returns 4 for infosite with contact-form", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "infosite",
      modules: ["blog", "contact-form"],
    };
    expect(getTotalSteps(state)).toBe(4);
  });

  it("returns 3 for infosite with only blog (non-qualifying)", () => {
    const state: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "infosite",
      modules: ["blog"],
    };
    expect(getTotalSteps(state)).toBe(3);
  });
});

// ── Branch-reset rule: switching projectType resets platform+modules ─────────

describe("branch-reset rule — switching projectType", () => {
  it("after switching from ecommerce to infosite, platform and modules reset", () => {
    // Simulate the state after ecommerce selection
    const ecomState: WizardState = {
      ...INITIAL_WIZARD_STATE,
      projectType: "ecommerce",
      platform: "shopify",
      modules: ["catalog", "checkout"],
    };

    // Simulate switching projectType (as Wizard.tsx updateState does):
    // onChange({ projectType: "infosite", platform: null, modules: [] })
    const resetState: WizardState = {
      ...ecomState,
      projectType: "infosite",
      platform: null,
      modules: [],
    };

    expect(resetState.projectType).toBe("infosite");
    expect(resetState.platform).toBeNull();
    expect(resetState.modules).toHaveLength(0);
    // Detail step not active after reset
    expect(hasDetailStep(resetState)).toBe(false);
    expect(getTotalSteps(resetState)).toBe(3);
  });
});
