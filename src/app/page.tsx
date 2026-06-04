import { getSampleTestCase } from "@/lib/test-cases";
import TestCaseCard from "@/components/TestCaseCard";

export default function Home() {
  const testCase = getSampleTestCase();

  return (
    <main className="flex flex-1 flex-col items-center min-h-screen bg-gray-50 px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Конструктор тест кейсів
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        Генератор тест кейсів для QA-команди
      </p>

      <TestCaseCard testCase={testCase} />
    </main>
  );
}
