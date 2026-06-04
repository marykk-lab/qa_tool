"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ECOMMERCE_PLATFORMS, INFOSITE_PLATFORMS } from "@/constants/wizard-config";
import type { ProjectType, EcommercePlatform, InfositePlatform } from "@/lib/types";

type Props = {
  projectType: ProjectType;
  value: EcommercePlatform | InfositePlatform | null;
  onChange: (value: string) => void;
};

export default function StepPlatform({ projectType, value, onChange }: Props) {
  const options =
    projectType === "ecommerce" ? ECOMMERCE_PLATFORMS : INFOSITE_PLATFORMS;
  const description =
    projectType === "ecommerce"
      ? "На якій платформі побудовано ваш E-commerce?"
      : "На якій платформі побудований ваш сайт?";

  return (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Платформа</h2>
      <p className="text-base text-muted-foreground mb-4">{description}</p>
      <RadioGroup
        value={value ?? ""}
        onValueChange={onChange}
        className="space-y-3"
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            className={cn(
              "flex items-center space-x-3 min-h-[44px] border rounded-md p-4 cursor-pointer transition-colors",
              value === opt.value
                ? "border-primary ring-1 ring-primary bg-card"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <RadioGroupItem value={opt.value} id={opt.value} />
            <Label
              htmlFor={opt.value}
              className="text-base text-foreground cursor-pointer"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
