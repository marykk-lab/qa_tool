"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileX, ChevronDown, ChevronRight, Trash2, Copy, ExternalLink } from "lucide-react";
import type { WizardState, TestCase } from "@/lib/types";
import { MODULE_TC_PREFIXES, MODULE_DISPLAY_NAMES, PROMO_TC_PREFIX } from "@/constants/wizard-config";
import { PriorityBadge } from "./PriorityBadge";

type Props = {
  state: WizardState;
  allCases: TestCase[];
  onRestart: () => void;
};

// ── Generation helpers ────────────────────────────────────────────────────────

function filterCasesForModule(
  moduleId: string,
  state: WizardState,
  moduleFeatures: Record<string, string[]>,
  allCases: TestCase[]
): TestCase[] {
  const prefixes = [...(MODULE_TC_PREFIXES[moduleId] ?? [])];

  // Return early for modules with no JSON data
  if (prefixes.length === 0) return [];

  // Checkout: conditionally include promo-code cases
  if (moduleId === "checkout" && state.checkoutDetails?.hasPromoCode === true) {
    prefixes.push(PROMO_TC_PREFIX);
  }

  // Filter by prefix
  let cases = allCases.filter((tc) =>
    prefixes.some((p) => tc.ID.startsWith(p))
  );

  // Apply ID-based exclusions based on detail flags
  if (moduleId === "checkout") {
    if (state.checkoutDetails?.hasGuestCheckout === false) {
      cases = cases.filter((tc) => tc.ID !== "TC-CHK-003");
    }
    if (state.checkoutDetails?.hasPromoCode === false) {
      cases = cases.filter((tc) => tc.ID !== "TC-CHK-005");
    }
  }

  if (moduleId === "search") {
    if (state.searchDetails?.hasAutoComplete === false) {
      cases = cases.filter((tc) => tc.ID !== "TC-SRCH-003");
    }
    if (state.searchDetails?.hasFiltersInResults === false) {
      cases = cases.filter((tc) => tc.ID !== "TC-SRCH-004");
    }
  }

  if (moduleId === "contact-form") {
    if (state.contactFormDetails?.hasFileUpload === false) {
      cases = cases.filter((tc) => tc.ID !== "TC-FORM-003");
    }
    if (state.contactFormDetails?.hasCaptcha === false) {
      cases = cases.filter((tc) => tc.ID !== "TC-FORM-004");
    }
  }

  if (moduleId === "multilang") {
    if (state.multilangDetails?.languageCount === "2") {
      cases = cases.filter((tc) => tc.ID !== "TC-LANG-003");
    }
  }

  // auth: hasSocialLogin / hasOrderHistory collected but no TC-AUTH exclusion IDs defined in v1

  // Feature filtering (Phase 4, per D-12)
  const selectedFeatures = moduleFeatures[moduleId] ?? [];
  if (selectedFeatures.length > 0) {
    cases = cases.filter(
      (tc) => !tc.Feature || selectedFeatures.includes(tc.Feature)
    );
  }

  return cases;
}

function buildMarkdown(
  modules: string[],
  state: WizardState,
  casesByModule: Map<string, TestCase[]>
): string {
  const projectTypeLabel =
    state.projectType === "ecommerce" ? "E-commerce" : "Інформаційний сайт";
  const todayISO = new Date().toISOString().slice(0, 10);

  // Build suite map from all filtered cases
  const suiteMap = new Map<string, TestCase[]>();
  for (const moduleId of modules) {
    const cases = casesByModule.get(moduleId) ?? [];
    for (const tc of cases) {
      if (!suiteMap.has(tc.Suite)) suiteMap.set(tc.Suite, []);
      suiteMap.get(tc.Suite)!.push(tc);
    }
  }

  const PRIORITY_LABELS: Record<string, string> = {
    P0: "P0 Critical",
    P1: "P1 Important",
    P2: "P2 Nice to have",
  };

  function sanitize(val: string): string {
    return val.replace(/\|/g, "/");
  }

  let output = `# Результати тестування — ${projectTypeLabel} — ${todayISO}`;

  for (const [suiteName, cases] of suiteMap) {
    output += `\n\n## ${suiteName}\n\n`;
    output += "| Title | Steps | Expected Result | Preconditions | Priority | Status | Last Verified |\n";
    output += "|-------|-------|-----------------|---------------|----------|--------|---------------|\n";
    for (const tc of cases) {
      const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join(" ");
      const row = [
        sanitize(tc.Назва),
        sanitize(steps),
        sanitize(tc["Очікуваний результат"]),
        sanitize(tc.Передумови),
        sanitize(PRIORITY_LABELS[tc.Пріоритет] ?? tc.Пріоритет),
        "Not started",
        "—",
      ].join(" | ");
      output += `| ${row} |\n`;
    }
  }

  return output;
}

function buildCsv(
  modules: string[],
  casesByModule: Map<string, TestCase[]>
): string {
  const BOM = "﻿";
  const headerRow = "Title,Steps,Expected Result,Preconditions,Priority,Status,Last Verified\n";

  const PRIORITY_LABELS: Record<string, string> = {
    P0: "P0 Critical",
    P1: "P1 Important",
    P2: "P2 Nice to have",
  };

  function escapeCell(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  // Group by suite for consistent ordering
  const suiteMap = new Map<string, TestCase[]>();
  for (const moduleId of modules) {
    const cases = casesByModule.get(moduleId) ?? [];
    for (const tc of cases) {
      if (!suiteMap.has(tc.Suite)) suiteMap.set(tc.Suite, []);
      suiteMap.get(tc.Suite)!.push(tc);
    }
  }

  let dataRows = "";
  for (const cases of suiteMap.values()) {
    for (const tc of cases) {
      const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const row = [
        escapeCell(tc.Назва),
        escapeCell(steps),
        escapeCell(tc["Очікуваний результат"]),
        escapeCell(tc.Передумови),
        escapeCell(PRIORITY_LABELS[tc.Пріоритет] ?? tc.Пріоритет),
        escapeCell("Not started"),
        escapeCell("—"),
      ].join(",");
      dataRows += row + "\n";
    }
  }

  return BOM + headerRow + dataRows;
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsView({ state, allCases, onRestart }: Props) {
  const filteredModules = state.modules.filter(
    (m) => filterCasesForModule(m, state, state.moduleFeatures, allCases).length > 0
  );
  const casesByModule = useMemo(
    () => new Map(filteredModules.map((m) => [m, filterCasesForModule(m, state, state.moduleFeatures, allCases)])),
    [filteredModules, state, allCases]
  );
  const isEmpty = filteredModules.length === 0;

  // State for collapsed suites — empty Set means all expanded
  const [collapsedSuites, setCollapsedSuites] = useState<Set<string>>(new Set());

  // Group filtered cases by Suite for rendering
  const suiteMap = new Map<string, TestCase[]>();
  for (const moduleId of filteredModules) {
    const cases = casesByModule.get(moduleId) ?? [];
    for (const tc of cases) {
      const suite = tc.Suite;
      if (!suiteMap.has(suite)) suiteMap.set(suite, []);
      suiteMap.get(suite)!.push(tc);
    }
  }
  const suiteNames = Array.from(suiteMap.keys());

  // Empty state
  if (isEmpty) {
    return (
      <div className="px-8 py-12 text-center">
        <FileX
          className="w-12 h-12 text-muted-foreground mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Тест кейси не знайдено
        </h2>
        <p className="text-base text-muted-foreground">
          За обраними параметрами кейсів не знайдено. Поверніться назад і
          скоригуйте вибір модулів.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("px-8 py-6")}>
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Результати тестування
      </h2>

      {/* Suite blocks */}
      {suiteNames.map((suiteName) => {
        const cases = suiteMap.get(suiteName) ?? [];
        const isCollapsed = collapsedSuites.has(suiteName);
        return (
          <div key={suiteName} className="mb-6 last:mb-0">
            {/* Collapsible suite header */}
            <button
              type="button"
              onClick={() => {
                setCollapsedSuites((prev) => {
                  const next = new Set(prev);
                  if (next.has(suiteName)) next.delete(suiteName);
                  else next.add(suiteName);
                  return next;
                });
              }}
              className="flex items-center gap-2 w-full text-left mb-4 group"
              aria-expanded={!isCollapsed}
            >
              {isCollapsed
                ? <ChevronRight className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />
              }
              <span className="text-xl font-semibold text-foreground">{suiteName}</span>
              <span className="text-sm text-muted-foreground ml-1">{cases.length}</span>
            </button>
            {/* Table — hidden when collapsed */}
            {!isCollapsed && (
              <div
                className="w-full overflow-x-auto rounded-md border border-border"
                role="region"
                aria-label={`Тест кейси — ${suiteName}`}
              >
                <table className="w-full text-sm text-foreground">
                  <thead>
                    <tr className="bg-card border-b border-border">
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[160px]">Title</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[200px]">Steps</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[180px]">Expected Result</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[160px]">Preconditions</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground w-[130px]">Priority</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground w-[110px]">Status</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-normal text-muted-foreground w-[120px]">Last Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((tc) => (
                      <tr
                        key={tc.ID}
                        className="border-b border-border last:border-0 hover:bg-secondary/30 group/row"
                      >
                        <td className="px-4 py-3 text-sm font-normal align-top text-foreground">
                          <div className="flex items-start justify-between gap-2">
                            <span>{tc.Назва}</span>
                            {/* Row hover action icons — visual only (v1) */}
                            <div className="hidden group-hover/row:flex items-center gap-1 shrink-0">
                              <button type="button" aria-label="Видалити" className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" aria-label="Дублювати" className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" aria-label="Відкрити" className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-normal align-top">
                          <ol className="space-y-1 text-foreground list-none">
                            {tc.Кроки.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </td>
                        <td className="px-4 py-3 text-sm font-normal align-top text-foreground">{tc["Очікуваний результат"]}</td>
                        <td className="px-4 py-3 text-sm font-normal align-top text-foreground">{tc.Передумови}</td>
                        <td className="px-4 py-3 align-top"><PriorityBadge priority={tc.Пріоритет} /></td>
                        <td className="px-4 py-3 text-sm font-normal align-top text-muted-foreground">Not started</td>
                        <td className="px-4 py-3 text-sm font-normal align-top text-muted-foreground">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Action buttons */}
      <div className="mt-12 flex flex-wrap gap-4 justify-center">
        {/* Copy Markdown — primary */}
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-semibold rounded-md"
          onClick={async () => {
            const md = buildMarkdown(filteredModules, state, casesByModule);
            try {
              await navigator.clipboard.writeText(md);
              toast.success("Markdown скопійовано в буфер обміну");
            } catch {
              toast.error(
                "Не вдалося скопіювати. Спробуйте ще раз або виберіть текст вручну."
              );
            }
          }}
        >
          Скопіювати Markdown
        </Button>

        {/* Download .md — outline accent */}
        <Button
          variant="ghost"
          className="border border-primary text-primary hover:bg-primary/10 h-10 px-6 text-sm font-semibold rounded-md"
          onClick={() => {
            const md = buildMarkdown(filteredModules, state, casesByModule);
            const filename = `test-cases_${state.projectType}_${new Date()
              .toISOString()
              .slice(0, 10)}.md`;
            downloadFile(md, filename, "text/markdown;charset=utf-8");
          }}
        >
          Завантажити .md
        </Button>

        {/* Export Notion CSV — neutral outline */}
        <Button
          variant="ghost"
          className="border border-white/25 text-foreground hover:bg-secondary h-10 px-6 text-sm font-semibold rounded-md"
          onClick={() => {
            const csv = buildCsv(filteredModules, casesByModule);
            const filename = `test-cases_${state.projectType}_${new Date()
              .toISOString()
              .slice(0, 10)}.csv`;
            downloadFile(csv, filename, "text/csv;charset=utf-8");
          }}
        >
          Експорт до Notion (.csv)
        </Button>

        {/* Restart — ghost */}
        <Button
          variant="ghost"
          className="border border-white/15 text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-10 px-6 text-sm font-semibold rounded-md"
          onClick={onRestart}
        >
          Почати заново
        </Button>
      </div>
    </div>
  );
}
