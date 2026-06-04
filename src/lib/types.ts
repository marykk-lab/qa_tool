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

  /** Pre-conditions that must be true before the test begins */
  Передумови: string;

  /** Ordered list of test steps */
  Кроки: string[];

  /** Expected system behaviour after all steps are executed */
  "Очікуваний результат": string;

  /** Test priority level */
  Пріоритет: "High" | "Medium" | "Low";
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
};
