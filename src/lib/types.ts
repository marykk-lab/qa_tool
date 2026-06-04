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
