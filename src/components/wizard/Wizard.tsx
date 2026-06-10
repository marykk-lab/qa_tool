"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { INITIAL_WIZARD_STATE, type WizardState, type TestCase } from "@/lib/types";
import { getTotalSteps, MODULE_FEATURES, MODULE_DISPLAY_NAMES } from "@/constants/wizard-config";
import { Card, CardContent } from "@/components/ui/card";
import StepProjectType from "./StepProjectType";
import StepPlatform from "./StepPlatform";
import StepModules from "./StepModules";
import StepModuleFeatures from "./StepModuleFeatures";
import WizardNav from "./WizardNav";
import ResultsView from "./ResultsView";

const STORAGE_KEY = "qa-wizard-state";
const STORAGE_VERSION = 1;

type WizardProps = {
  initialCases: TestCase[];
};

export default function Wizard({ initialCases }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === STORAGE_VERSION) {
          setState(parsed.state ?? INITIAL_WIZARD_STATE);
          setCurrentStep(parsed.step ?? 1);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, step: currentStep, state }));
    } catch {}
  }, [state, currentStep, hydrated]);

  const totalSteps = getTotalSteps(state);
  const isCompletion = currentStep > totalSteps;

  function handleNext() {
    if (currentStep === 1 && !state.projectType) {
      toast.error("Будь ласка, оберіть тип проекту");
      return;
    }
    if (currentStep === 2 && !state.platform) {
      toast.error("Будь ласка, оберіть платформу");
      return;
    }
    if (currentStep === 3 && state.modules.length === 0) {
      toast.error("Оберіть принаймні один модуль для тестування");
      return;
    }
    // steps >= 4 are module sub-steps: features are optional, always advance
    setCurrentStep((prev) => prev + 1);
  }

  function handleBack() {
    if (isCompletion) {
      // Go back to last sub-step (or step 3 if 0 modules)
      setCurrentStep(totalSteps);
      return;
    }
    setCurrentStep((prev) => Math.max(1, prev - 1));
  }

  function updateState(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Card className="w-full border border-border bg-card shadow-sm rounded-lg">
      <CardContent className="p-0">
        <WizardNav
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          state={state}
          isCompletion={isCompletion}
        />
        {currentStep === 1 && (
          <StepProjectType
            value={state.projectType}
            onChange={(v) =>
              updateState({ projectType: v, platform: null, modules: [] })
            }
          />
        )}
        {currentStep === 2 && (
          <StepPlatform
            projectType={state.projectType!}
            value={state.platform}
            onChange={(v) =>
              updateState({ platform: v as WizardState["platform"] })
            }
          />
        )}
        {currentStep === 3 && (
          <StepModules
            projectType={state.projectType!}
            selected={state.modules}
            onChange={(modules) => updateState({ modules })}
          />
        )}
        {state.modules.map((moduleId, index) => {
          const subStep = 4 + index;
          return currentStep === subStep ? (
            <StepModuleFeatures
              key={moduleId}
              moduleId={moduleId}
              moduleName={MODULE_DISPLAY_NAMES[moduleId] ?? moduleId}
              features={MODULE_FEATURES[moduleId] ?? []}
              selected={state.moduleFeatures[moduleId] ?? []}
              onChange={(v) =>
                updateState({ moduleFeatures: { ...state.moduleFeatures, [moduleId]: v } })
              }
            />
          ) : null;
        })}
        {isCompletion && (
          <ResultsView
            state={state}
            allCases={initialCases}
            onRestart={() => {
              try { localStorage.removeItem(STORAGE_KEY); } catch {}
              setState(INITIAL_WIZARD_STATE);
              setCurrentStep(1);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
