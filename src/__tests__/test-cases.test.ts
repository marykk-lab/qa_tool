/**
 * TDD RED: Tests for JSON data layer and TestCase schema
 *
 * Describes expected behavior per Task 2 <behavior> block:
 * - Loading sample.json returns an object matching TestCase type
 * - ID starts with "TC-"
 * - Пріоритет is one of "High" | "Medium" | "Low"
 * - Кроки is a non-empty array of strings
 * - All six schema fields are present
 */

import { getSampleTestCase } from "../lib/test-cases";
import type { TestCase } from "../lib/types";

describe("TestCase schema and loader", () => {
  let testCase: TestCase;

  beforeAll(() => {
    testCase = getSampleTestCase();
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
