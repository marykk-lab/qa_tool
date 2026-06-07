"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileX } from "lucide-react";
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

  return cases;
}

function buildMarkdown(
  modules: string[],
  state: WizardState,
  allCases: TestCase[]
): string {
  const projectTypeLabel =
    state.projectType === "ecommerce" ? "E-commerce" : "Інформаційний сайт";
  const todayISO = new Date().toISOString().slice(0, 10);

  let output = `# Результати тестування — ${projectTypeLabel} — ${todayISO}`;

  for (const moduleId of modules) {
    const cases = filterCasesForModule(moduleId, state, allCases);
    if (cases.length === 0) continue;

    output += `\n\n## ${MODULE_DISPLAY_NAMES[moduleId]} (${cases.length})\n`;
    output +=
      "| ID | Назва | Передумови | Кроки | Очікуваний результат | Пріоритет |\n";
    output +=
      "|----|-------|------------|-------|----------------------|-----------|\n";

    for (const tc of cases) {
      const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join("<br>");
      const row = [
        tc.ID,
        tc.Назва,
        tc.Передумови,
        steps,
        tc["Очікуваний результат"],
        tc.Пріоритет,
      ]
        .map((cell) => cell.replace(/\|/g, "\\|"))
        .join(" | ");
      output += `| ${row} |\n`;
    }
  }

  return output;
}

function buildCsv(
  modules: string[],
  state: WizardState,
  allCases: TestCase[]
): string {
  const BOM = "﻿";
  const headerRow =
    "ID,Name,Preconditions,Steps,Expected,Priority,Module\n";

  function escapeCell(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  let dataRows = "";

  for (const moduleId of modules) {
    const cases = filterCasesForModule(moduleId, state, allCases);
    for (const tc of cases) {
      const steps = tc.Кроки.map((s, i) => `${i + 1}. ${s}`).join("\n");
      const row = [
        escapeCell(tc.ID),
        escapeCell(tc.Назва),
        escapeCell(tc.Передумови),
        escapeCell(steps),
        escapeCell(tc["Очікуваний результат"]),
        escapeCell(tc.Пріоритет),
        escapeCell(MODULE_DISPLAY_NAMES[moduleId] ?? moduleId),
      ].join(",");
      dataRows += row + "\n";
    }
  }

  return BOM + headerRow + dataRows;
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsView({ state, allCases, onRestart }: Props) {
  const filteredModules = state.modules.filter(
    (m) => filterCasesForModule(m, state, allCases).length > 0
  );
  const isEmpty = filteredModules.length === 0;

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

      {/* Module blocks */}
      {filteredModules.map((moduleId) => {
        const cases = filterCasesForModule(moduleId, state, allCases);
        return (
          <div key={moduleId} className="mb-6 last:mb-0">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {MODULE_DISPLAY_NAMES[moduleId]} ({cases.length})
            </h3>
            <div
              className="w-full overflow-x-auto rounded-md border border-border"
              role="region"
              aria-label={`Тест кейси — ${MODULE_DISPLAY_NAMES[moduleId]}`}
            >
              <table className="w-full text-sm text-foreground">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-normal text-muted-foreground w-[110px]"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[160px]"
                    >
                      Назва
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[180px]"
                    >
                      Передумови
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[200px]"
                    >
                      Кроки
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-normal text-muted-foreground min-w-[180px]"
                    >
                      Очікуваний результат
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-normal text-muted-foreground w-[110px]"
                    >
                      Пріоритет
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((tc) => (
                    <tr
                      key={tc.ID}
                      className="border-b border-border last:border-0 hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 text-sm font-normal align-top text-muted-foreground">
                        {tc.ID}
                      </td>
                      <td className="px-4 py-3 text-sm font-normal align-top text-foreground">
                        {tc.Назва}
                      </td>
                      <td className="px-4 py-3 text-sm font-normal align-top text-foreground">
                        {tc.Передумови}
                      </td>
                      <td className="px-4 py-3 text-sm font-normal align-top">
                        <ol className="list-decimal list-inside space-y-1 text-foreground">
                          {tc.Кроки.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </td>
                      <td className="px-4 py-3 text-sm font-normal align-top text-foreground">
                        {tc["Очікуваний результат"]}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <PriorityBadge priority={tc.Пріоритет} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Action buttons */}
      <div className="mt-12 flex flex-wrap gap-4">
        {/* Copy Markdown — primary */}
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-semibold rounded-md"
          onClick={async () => {
            const md = buildMarkdown(state.modules, state, allCases);
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
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10 h-10 px-6 text-sm font-semibold rounded-md"
          onClick={() => {
            const md = buildMarkdown(state.modules, state, allCases);
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
          variant="outline"
          className="border-border text-foreground hover:bg-secondary h-10 px-6 text-sm font-semibold rounded-md"
          onClick={() => {
            const csv = buildCsv(state.modules, state, allCases);
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
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-10 px-6 text-sm font-semibold rounded-md"
          onClick={onRestart}
        >
          Почати заново
        </Button>
      </div>
    </div>
  );
}
