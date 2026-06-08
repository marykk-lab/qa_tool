"use client";

import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  moduleId: string;
  moduleName: string;
  features: string[];
  selected: string[];
  onChange: (v: string[]) => void;
};

export default function StepModuleFeatures({
  moduleId,
  moduleName,
  features,
  selected,
  onChange,
}: Props) {
  function toggle(feature: string) {
    if (selected.includes(feature)) {
      onChange(selected.filter((f) => f !== feature));
    } else {
      onChange([...selected, feature]);
    }
  }

  return (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">
        {moduleName} — що є в модулі?
      </h2>
      <p className="text-base text-muted-foreground mb-4">
        Оберіть функції, які реалізовані у вашому проекті
      </p>
      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            onClick={() => toggle(feature)}
            className="flex items-center space-x-3 min-h-[44px] border border-border rounded-md p-4 bg-card cursor-pointer"
          >
            <Checkbox
              id={`${moduleId}-${feature}`}
              checked={selected.includes(feature)}
              onCheckedChange={() => toggle(feature)}
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor={`${moduleId}-${feature}`} className="text-base text-foreground cursor-pointer">{feature}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
