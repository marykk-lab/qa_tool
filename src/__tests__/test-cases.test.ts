/**
 * Tests for JSON data layer and TestCase schema
 *
 * Describes expected behavior:
 * - loadAllTestCases() returns >= 40 test cases across all 10 module files (GEN-01)
 * - Every returned TestCase has all six schema keys and a valid Пріоритет (GEN-03)
 * - All 10 ID prefixes are present in the flattened set (GEN-04)
 * - No two test cases share the same ID (uniqueness)
 * - The first test case in the flattened set matches the TC-CAT schema
 */

import { loadAllTestCases } from "../lib/test-cases";
import type { TestCase } from "../lib/types";

// ── Legacy single-case schema tests (migrated from getSampleTestCase / sample.json) ──

describe("TestCase schema and loader (first catalog entry as representative)", () => {
  let testCase: TestCase;

  beforeAll(() => {
    const all = loadAllTestCases();
    // TC-CAT-001 is the first entry in catalog.json; loadAllTestCases flattens all files
    const catCase = all.find((tc) => tc.ID === "TC-CAT-001");
    if (!catCase) throw new Error("TC-CAT-001 not found — catalog.json may be missing");
    testCase = catCase;
  });

  it("should return an object matching the TestCase type (all 6 fields present)", () => {
    expect(testCase).toBeDefined();
    expect(typeof testCase.ID).toBe("string");
    expect(typeof testCase["Назва"]).toBe("string");
    expect(typeof testCase["Передумови"]).toBe("string");
    expect(Array.isArray(testCase["Кроки"])).toBe(true);
    expect(typeof testCase["Очікуваний результат"]).toBe("string");
    expect(typeof testCase["Пріоритет"]).toBe("string");
  });

  it("should have a non-empty ID beginning with 'TC-' prefix", () => {
    expect(testCase.ID).toBeTruthy();
    expect(testCase.ID.startsWith("TC-")).toBe(true);
  });

  it("should have Пріоритет as one of 'High' | 'Medium' | 'Low'", () => {
    const validPriorities = ["High", "Medium", "Low"];
    expect(validPriorities).toContain(testCase["Пріоритет"]);
  });

  it("should have a non-empty Кроки array with at least one step string", () => {
    const steps = testCase["Кроки"];
    expect(steps.length).toBeGreaterThan(0);
    steps.forEach((step) => {
      expect(typeof step).toBe("string");
      expect(step.length).toBeGreaterThan(0);
    });
  });

  it("should have non-empty Назва", () => {
    expect(testCase["Назва"].length).toBeGreaterThan(0);
  });

  it("should have non-empty Очікуваний результат", () => {
    expect(testCase["Очікуваний результат"].length).toBeGreaterThan(0);
  });
});

// ── Extended loader validation: count, schema, prefixes, uniqueness (GEN-01, GEN-03, GEN-04) ──

describe("loadAllTestCases — full library validation", () => {
  const REQUIRED_PREFIXES = [
    "TC-CAT",
    "TC-PDP",
    "TC-CART",
    "TC-CHK",
    "TC-AUTH",
    "TC-SRCH",
    "TC-BLOG",
    "TC-FORM",
    "TC-LANG",
    "TC-CPN",
  ] as const;

  const VALID_PRIORITIES = ["High", "Medium", "Low"] as const;

  let allCases: TestCase[];

  beforeAll(() => {
    allCases = loadAllTestCases();
  });

  it("should return at least 40 test cases across all module files (GEN-01)", () => {
    expect(allCases.length).toBeGreaterThanOrEqual(40);
  });

  it("should have all six schema fields present in every test case (GEN-03)", () => {
    const requiredKeys: (keyof TestCase)[] = [
      "ID",
      "Назва",
      "Передумови",
      "Кроки",
      "Очікуваний результат",
      "Пріоритет",
    ];
    for (const tc of allCases) {
      for (const key of requiredKeys) {
        expect(tc).toHaveProperty(key);
      }
    }
  });

  it("should have a non-empty Кроки array in every test case (GEN-03)", () => {
    for (const tc of allCases) {
      expect(Array.isArray(tc["Кроки"])).toBe(true);
      expect(tc["Кроки"].length).toBeGreaterThan(0);
    }
  });

  it("should have a valid Пріоритет in every test case (GEN-03)", () => {
    for (const tc of allCases) {
      expect(VALID_PRIORITIES).toContain(tc["Пріоритет"]);
    }
  });

  it("should contain at least one TC-CAT ID (catalog module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-CAT"))).toBe(true);
  });

  it("should contain at least one TC-PDP ID (product module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-PDP"))).toBe(true);
  });

  it("should contain at least one TC-CART ID (cart module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-CART"))).toBe(true);
  });

  it("should contain at least one TC-CHK ID (checkout module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-CHK"))).toBe(true);
  });

  it("should contain at least one TC-AUTH ID (auth module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-AUTH"))).toBe(true);
  });

  it("should contain at least one TC-SRCH ID (search module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-SRCH"))).toBe(true);
  });

  it("should contain at least one TC-BLOG ID (blog module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-BLOG"))).toBe(true);
  });

  it("should contain at least one TC-FORM ID (contact form module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-FORM"))).toBe(true);
  });

  it("should contain at least one TC-LANG ID (multilang module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-LANG"))).toBe(true);
  });

  it("should contain at least one TC-CPN ID (coupons module — GEN-04)", () => {
    const prefixIds = allCases.map((tc) => tc.ID);
    expect(prefixIds.some((id) => id.startsWith("TC-CPN"))).toBe(true);
  });

  it("should cover all 10 required module prefixes in the flattened set (GEN-04)", () => {
    const ids = allCases.map((tc) => tc.ID);
    for (const prefix of REQUIRED_PREFIXES) {
      expect(ids.some((id) => id.startsWith(prefix))).toBe(true);
    }
  });

  it("should have unique IDs across all test cases (no duplicates)", () => {
    const ids = allCases.map((tc) => tc.ID);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
