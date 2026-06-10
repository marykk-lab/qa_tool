"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileX, ChevronDown, ChevronRight, Trash2, Copy, ExternalLink } from "lucide-react";
import type { WizardState, TestCase } from "@/lib/types";
import { MODULE_TC_PREFIXES, PROMO_TC_PREFIX } from "@/constants/wizard-config";
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

  if (prefixes.length === 0) return [];

  if (moduleId === "checkout" && state.checkoutDetails?.hasPromoCode === true) {
    prefixes.push(PROMO_TC_PREFIX);
  }

  let cases = allCases.filter((tc) =>
    prefixes.some((p) => tc.ID.startsWith(p))
  );

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

  const selectedFeatures = moduleFeatures[moduleId] ?? [];
  if (selectedFeatures.length > 0) {
    cases = cases.filter(
      (tc) => !tc.Feature || selectedFeatures.includes(tc.Feature)
    );
  }

  return cases;
}

const PRIORITY_LABELS: Record<string, string> = {
  P0: "P0 Critical",
  P1: "P1 Important",
  P2: "P2 Nice to have",
};

function sanitize(val: string): string {
  return val.replace(/\|/g, "/");
}

function buildMarkdown(suiteMap: Map<string, TestCase[]>): string {
  let output = "| Suite | Test Case | Priority | Status | Preconditions | Steps | Expected Result | Test Data | Test Layer | Test Type | Last Verified |\n";
  output += "|-------|-----------|----------|--------|---------------|-------|-----------------|-----------|------------|-----------|---------------|\n";

  for (const [, cases] of suiteMap) {
    for (const tc of cases) {
      const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join(" ");
      const row = [
        sanitize(tc.Suite),
        sanitize(tc.Назва),
        sanitize(PRIORITY_LABELS[tc.Пріоритет] ?? tc.Пріоритет),
        "Not started",
        sanitize(tc.Передумови),
        sanitize(steps),
        sanitize(tc["Очікуваний результат"]),
        sanitize(tc["Тестові дані"]),
        sanitize(tc.Layer),
        sanitize(tc.Type),
        "",
      ].join(" | ");
      output += `| ${row} |\n`;
    }
  }

  return output;
}

function buildCsv(suiteMap: Map<string, TestCase[]>): string {
  const BOM = "﻿";
  const headerRow = "Suite,Test Case,Priority,Status,Preconditions,Steps,Expected Result,Test Data,Test Layer,Test Type,Last Verified\n";

  function escapeCell(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  let dataRows = "";
  for (const cases of suiteMap.values()) {
    for (const tc of cases) {
      const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const row = [
        escapeCell(tc.Suite),
        escapeCell(tc.Назва),
        escapeCell(PRIORITY_LABELS[tc.Пріоритет] ?? tc.Пріоритет),
        escapeCell("Not started"),
        escapeCell(tc.Передумови),
        escapeCell(steps),
        escapeCell(tc["Очікуваний результат"]),
        escapeCell(tc["Тестові дані"]),
        escapeCell(tc.Layer),
        escapeCell(tc.Type),
        escapeCell(""),
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
  const { suiteMap, isEmpty } = useMemo(() => {
    const filtered = state.modules.filter(
      (m) => filterCasesForModule(m, state, state.moduleFeatures, allCases).length > 0
    );
    const byModule = new Map(
      filtered.map((m) => [m, filterCasesForModule(m, state, state.moduleFeatures, allCases)])
    );
    const suites = new Map<string, TestCase[]>();
    for (const moduleId of filtered) {
      for (const tc of byModule.get(moduleId) ?? []) {
        if (!suites.has(tc.Suite)) suites.set(tc.Suite, []);
        suites.get(tc.Suite)!.push(tc);
      }
    }
    return {
      suiteMap: suites,
      isEmpty: filtered.length === 0,
    };
  }, [state, allCases]);

  // Local mutable copy — tracks user deletes and duplicates
  const [localSuiteMap, setLocalSuiteMap] = useState<Map<string, TestCase[]>>(() =>
    new Map(Array.from(suiteMap.entries()).map(([k, v]) => [k, [...v]]))
  );

  const localSuiteNames = Array.from(localSuiteMap.keys()).filter(
    (k) => (localSuiteMap.get(k)?.length ?? 0) > 0
  );

  const [collapsedSuites, setCollapsedSuites] = useState<Set<string>>(new Set());

  function handleDelete(suiteName: string, tcId: string) {
    setLocalSuiteMap((prev) => {
      const next = new Map(prev);
      next.set(suiteName, (next.get(suiteName) ?? []).filter((t) => t.ID !== tcId));
      return next;
    });
    toast.success("Тест кейс видалено");
  }

  function handleDuplicate(suiteName: string, tc: TestCase) {
    setLocalSuiteMap((prev) => {
      const next = new Map(prev);
      const cases = [...(next.get(suiteName) ?? [])];
      const idx = cases.findIndex((t) => t.ID === tc.ID);
      const dup: TestCase = { ...tc, ID: `${tc.ID}-copy` };
      cases.splice(idx + 1, 0, dup);
      next.set(suiteName, cases);
      return next;
    });
    toast.success("Тест кейс продубльовано");
  }

  async function handleCopyRow(tc: TestCase) {
    const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join(" ");
    const text = `| ${[
      tc.Suite,
      tc.Назва,
      PRIORITY_LABELS[tc.Пріоритет] ?? tc.Пріоритет,
      "Not started",
      tc.Передумови,
      steps,
      tc["Очікуваний результат"],
      tc["Тестові дані"],
      tc.Layer,
      tc.Type,
      "",
    ].join(" | ")} |`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Рядок скопійовано в буфер обміну");
    } catch {
      toast.error("Не вдалося скопіювати рядок");
    }
  }

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
      {localSuiteNames.map((suiteName) => {
        const cases = localSuiteMap.get(suiteName) ?? [];
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
                <table className="w-full text-xs text-foreground">
                  <thead>
                    <tr className="bg-card border-b border-border">
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground min-w-[150px]">Test Case</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground min-w-[200px]">Steps</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground min-w-[170px]">Expected Result</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground min-w-[140px]">Preconditions</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground min-w-[140px]">Test Data</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground w-[110px]">Priority</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground w-[90px]">Status</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground w-[90px]">Test Layer</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground w-[90px]">Test Type</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-normal text-muted-foreground w-[90px]">Last Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((tc) => (
                      <tr
                        key={tc.ID}
                        className="border-b border-border last:border-0 hover:bg-secondary/30"
                      >
                        <td className="px-3 py-2 text-xs font-normal align-top text-foreground">
                          <div className="flex items-start justify-between gap-2">
                            <span>{tc.Назва}</span>
                            {/* Row action buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                aria-label="Видалити"
                                title="Видалити"
                                onClick={() => handleDelete(suiteName, tc.ID)}
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Дублювати"
                                title="Дублювати"
                                onClick={() => handleDuplicate(suiteName, tc)}
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Копіювати рядок"
                                title="Копіювати рядок"
                                onClick={() => handleCopyRow(tc)}
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs font-normal align-top">
                          <ol className="space-y-1 text-foreground list-none">
                            {tc.Кроки.map((step, i) => (
                              <li key={i}>{i + 1}. {step}</li>
                            ))}
                          </ol>
                        </td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-foreground">{tc["Очікуваний результат"]}</td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-foreground">{tc.Передумови}</td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-foreground">{tc["Тестові дані"]}</td>
                        <td className="px-3 py-2 align-top"><PriorityBadge priority={tc.Пріоритет} /></td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-muted-foreground">Not started</td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-muted-foreground">{tc.Layer}</td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-muted-foreground">{tc.Type}</td>
                        <td className="px-3 py-2 text-xs font-normal align-top text-muted-foreground"></td>
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
            const md = buildMarkdown(localSuiteMap);
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
            const md = buildMarkdown(localSuiteMap);
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
            const csv = buildCsv(localSuiteMap);
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
