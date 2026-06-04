import fs from "fs";
import path from "path";
import type { TestCase } from "./types";

/**
 * Returns the directory path where test case JSON files are stored.
 * Data lives at repo root /data/test-cases/ (NOT under src/) so QA engineers
 * can edit JSON without touching app code — matches GEN-01 convention.
 */
function getDataDir(): string {
  return path.join(process.cwd(), "data", "test-cases");
}

/**
 * Loads and parses a single JSON file from data/test-cases/ as a TestCase.
 * Throws if the file is not found or cannot be parsed.
 */
function loadTestCaseFile(filename: string): TestCase {
  const filePath = path.join(getDataDir(), filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as TestCase;
}

/**
 * Returns the sample test case from data/test-cases/sample.json.
 * Used on the home page to prove the full data→render→interact slice.
 */
export function getSampleTestCase(): TestCase {
  return loadTestCaseFile("sample.json");
}

/**
 * Loads all *.json files from data/test-cases/ and returns a flat TestCase[].
 * Handles both single-object JSON files and array JSON files.
 * Skips files that fail to parse (logs a warning to stderr).
 */
export function loadAllTestCases(): TestCase[] {
  const dataDir = getDataDir();
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

  const results: TestCase[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        results.push(...(parsed as TestCase[]));
      } else {
        results.push(parsed as TestCase);
      }
    } catch (err) {
      console.error(`[test-cases] Failed to load ${file}:`, err);
    }
  }
  return results;
}

/**
 * Loads test cases for a specific module by ID prefix.
 * E.g., loadModuleTestCases("TC-CHK") returns all checkout test cases.
 */
export function loadModuleTestCases(prefix: string): TestCase[] {
  return loadAllTestCases().filter((tc) => tc.ID.startsWith(prefix));
}
