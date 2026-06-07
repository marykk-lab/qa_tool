// No "use client" directive — page.tsx stays a Server Component.
// Wizard.tsx is "use client" and owns all state.
import Wizard from "@/components/wizard/Wizard";
import { loadAllTestCases } from "@/lib/test-cases";
import type { TestCase } from "@/lib/types";

export default async function Home() {
  const allCases: TestCase[] = loadAllTestCases();
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Конструктор тест кейсів
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Генератор тест кейсів для QA-команди
        </p>
        <Wizard initialCases={allCases} />
      </div>
    </main>
  );
}
