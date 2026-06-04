/**
 * TDD RED: Tests for WizardState shape and INITIAL_WIZARD_STATE
 *
 * Describes expected behavior per Task 4 <behavior> block:
 * - INITIAL_WIZARD_STATE has projectType null
 * - INITIAL_WIZARD_STATE has platform null
 * - INITIAL_WIZARD_STATE has modules [] (length 0)
 * - All five detail fields are null
 */

import { INITIAL_WIZARD_STATE } from "../lib/types";
import type { WizardState } from "../lib/types";

describe("WizardState shape and INITIAL_WIZARD_STATE", () => {
  it("should have all required fields in INITIAL_WIZARD_STATE", () => {
    const state = INITIAL_WIZARD_STATE;
    expect(state.projectType).toBeNull();
    expect(state.platform).toBeNull();
    expect(Array.isArray(state.modules)).toBe(true);
    expect(state.modules.length).toBe(0);
    expect(state.checkoutDetails).toBeNull();
    expect(state.authDetails).toBeNull();
    expect(state.searchDetails).toBeNull();
    expect(state.contactFormDetails).toBeNull();
    expect(state.multilangDetails).toBeNull();
  });

  it("should satisfy WizardState type (TypeScript structural check)", () => {
    const typed: WizardState = INITIAL_WIZARD_STATE;
    expect(typed).toBeDefined();
  });
});
