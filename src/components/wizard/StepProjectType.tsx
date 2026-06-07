"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/lib/types";

type Props = {
  value: ProjectType | null;
  onChange: (value: ProjectType) => void;
};

const OPTIONS = [
  { value: "ecommerce" as ProjectType, label: "E-commerce" },
  { value: "infosite" as ProjectType, label: "Інформаційний сайт" },
];

export default function StepProjectType({ value, onChange }: Props) {
  return (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Тип проекту</h2>
      <p className="text-base text-muted-foreground mb-4">Оберіть тип вашого проекту</p>
      <RadioGroup
        value={value ?? ""}
        onValueChange={(v) => onChange(v as ProjectType)}
        className="space-y-3"
      >
        {OPTIONS.map((opt) => (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center space-x-3 min-h-[44px] border rounded-md p-4 cursor-pointer transition-colors",
              value === opt.value
                ? "border-primary ring-1 ring-primary bg-card"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <RadioGroupItem
              value={opt.value}
              id={opt.value}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-base text-foreground">{opt.label}</span>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
