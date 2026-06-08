/**
 * TestCase — the single schema contract for all phases of QA Test Constructor.
 *
 * Fields use agreed Ukrainian schema keys per GEN-03.
 * This type is the source of truth for:
 *   - data/test-cases/*.json file structure
 *   - src/lib/test-cases.ts loader return type
 *   - src/components/TestCaseCard.tsx props
 */
export type TestCase = {
  /** Unique identifier in format TC-{PREFIX}-{NUMBER}, e.g. TC-CAT-001 */
  ID: string;

  /** Short human-readable name of the test case */
  Назва: string;

  /** Test suite name — matches the module display name */
  Suite: string;

  /** Pre-conditions that must be true before the test begins */
  Передумови: string;

  /** Ordered list of test steps */
  Кроки: string[];

  /** Expected system behaviour after all steps are executed */
  "Очікуваний результат": string;

  /**
   * Test execution type.
   * E2E — manual browser walkthrough (default for most QA cases).
   * Manual — requires native device action (camera, biometrics, push, bank app).
   * Unit/Component/Integration — automated, filled by Lead/dev.
   */
  Type: "E2E" | "Manual" | "Unit" | "Component" | "Integration";

  /**
   * CI layer — when to run in the pipeline.
   * Smoke: 1–3 per suite, <30 s, on every deploy.
   * Regression: edge cases, before release.
   * Feature: new flow, not yet stabilised.
   */
  Layer: "Smoke" | "Regression" | "Feature";

  /**
   * Business criticality.
   * P0 — blocks business/operations (auth, payments, checkout).
   * P1 — main workflows (lists, filters, lifecycle).
   * P2 — secondary (UX polish, rare scenarios).
   */
  Пріоритет: "P0" | "P1" | "P2";

  /**
   * Optional feature tag matching MODULE_FEATURES key values — used for feature-based filtering in Phase 4.
   * Must match one of the MODULE_FEATURES strings for the test case's module.
   * Entries without Feature always pass through the feature filter.
   */
  Feature?: string;
};

// ── Wizard Types ──────────────────────────────────────────────────

export type ProjectType = "ecommerce" | "infosite";

export type EcommercePlatform = "woocommerce" | "shopify" | "other";
export type InfositePlatform = "wordpress" | "other";

export type CheckoutDetails = {
  hasGuestCheckout: boolean;
  hasPromoCode: boolean;
};
export type AuthDetails = {
  hasSocialLogin: boolean;
  hasOrderHistory: boolean;
};
export type SearchDetails = {
  hasAutoComplete: boolean;
  hasFiltersInResults: boolean;
};
export type ContactFormDetails = {
  hasFileUpload: boolean;
  hasCaptcha: boolean;
};
export type MultilangDetails = {
  languageCount: "2" | "3" | "4plus";
};

export type WizardState = {
  projectType: ProjectType | null;
  platform: EcommercePlatform | InfositePlatform | null;
  modules: string[];
  checkoutDetails: CheckoutDetails | null;
  authDetails: AuthDetails | null;
  searchDetails: SearchDetails | null;
  contactFormDetails: ContactFormDetails | null;
  multilangDetails: MultilangDetails | null;
  /** Maps module ID to array of checked feature strings. Default {}. Populated by StepModuleFeatures. */
  moduleFeatures: Record<string, string[]>;
};

export const INITIAL_WIZARD_STATE: WizardState = {
  projectType: null,
  platform: null,
  modules: [],
  checkoutDetails: null,
  authDetails: null,
  searchDetails: null,
  contactFormDetails: null,
  multilangDetails: null,
  moduleFeatures: {},
};
