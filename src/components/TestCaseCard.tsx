"use client";

import { useState } from "react";
import type { TestCase } from "@/lib/types";

type Props = {
  testCase: TestCase;
};

/** Maps priority to Tailwind badge color classes */
function priorityBadgeClass(priority: TestCase["Пріоритет"]): string {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 border border-red-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Low":
      return "bg-green-100 text-green-800 border border-green-200";
  }
}

export default function TestCaseCard({ testCase }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header: ID + Priority badge */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-sm font-mono text-gray-500">{testCase.ID}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityBadgeClass(
            testCase["Пріоритет"]
          )}`}
        >
          {testCase["Пріоритет"]}
        </span>
      </div>

      {/* Назва */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        <span className="text-xs font-normal text-gray-500 uppercase tracking-wide block mb-1">
          Назва
        </span>
        {testCase["Назва"]}
      </h2>

      {/* Передумови */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Передумови
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {testCase["Передумови"]}
        </p>
      </div>

      {/* Очікуваний результат */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Очікуваний результат
        </p>
        <p className="text-gray-700 text-sm leading-relaxed">
          {testCase["Очікуваний результат"]}
        </p>
      </div>

      {/* Кроки toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          aria-expanded={showDetails}
        >
          {showDetails ? "Приховати деталі" : "Показати деталі"}
          <span
            className={`inline-block transition-transform ${
              showDetails ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>

        {showDetails && (
          <ol className="mt-3 space-y-2 pl-1">
            {testCase["Кроки"].map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
