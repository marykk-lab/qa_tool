"use client";

import { useState } from "react";
import { toast } from "sonner";
import { INITIAL_WIZARD_STATE, type WizardState, type TestCase } from "@/lib/types";
import { getTotalSteps, hasDetailStep } from "@/constants/wizard-config";
import { Card, CardContent } from "@/components/ui/card";
import StepProjectType from "./StepProjectType";
import StepPlatform from "./StepPlatform";
import StepModules from "./StepModules";
import StepDetails from "./StepDetails";
import WizardNav from "./WizardNav";
import ResultsView from "./ResultsView";

type WizardProps = {
  initialCases: TestCase[];
};

export default function Wizard({ initialCases }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);

  const totalSteps = getTotalSteps(state);

  function handleNext() {
    // Validation guards — show Sonner toast on failure
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
    // After step 3: skip step 4 if no qualifying modules
    if (currentStep === 3 && !hasDetailStep(state)) {
      setCurrentStep(5); // 5 = completion
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }

  function handleBack() {
    // After skip: if on completion (step 5) with no detail step, go back to step 3
    if (currentStep === 5 && !hasDetailStep(state)) {
      setCurrentStep(3);
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
          isCompletion={currentStep === 5}
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
        {currentStep === 4 && (
          <StepDetails state={state} onChange={updateState} />
        )}
        {currentStep === 5 && (
          <ResultsView
            state={state}
            allCases={initialCases}
            onRestart={() => {
              setState(INITIAL_WIZARD_STATE);
              setCurrentStep(1);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
