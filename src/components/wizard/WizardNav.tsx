"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { WizardState } from "@/lib/types";

type Props = {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  state: WizardState;
  isCompletion: boolean;
};

// Derives whether "Далі" should be enabled for the current step
function canAdvance(step: number, state: WizardState): boolean {
  if (step === 1) return state.projectType !== null;
  if (step === 2) return state.platform !== null;
  if (step === 3) return state.modules.length > 0;
  if (step >= 4) return true; // sub-steps: features are optional
  return false;
}

export default function WizardNav({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  state,
  isCompletion,
}: Props) {
  const displayStep = Math.min(currentStep, totalSteps); // cap at totalSteps for completion
  const percent = Math.round((displayStep / totalSteps) * 100);

  return (
    <>
      {/* Progress section */}
      <div className="px-8 pt-6 pb-4">
        <p className="text-sm text-muted-foreground mb-2">
          {isCompletion ? "Готово" : `Крок ${displayStep} з ${totalSteps}`}
        </p>
        <Progress value={isCompletion ? 100 : percent} className="h-1 rounded-full" />
      </div>

      {/* Navigation row — rendered BELOW step content via Wizard.tsx layout */}
      <div className="px-8 pb-6 pt-0 flex justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={currentStep === 1}
          className="border border-white/25 text-foreground hover:bg-secondary hover:text-foreground"
        >
          Назад
        </Button>
        {!isCompletion && (
          <Button
            onClick={onNext}
            disabled={!canAdvance(currentStep, state)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Далі
          </Button>
        )}
      </div>
    </>
  );
}
