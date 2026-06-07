"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ECOMMERCE_MODULES, INFOSITE_MODULES } from "@/constants/wizard-config";
import type { ProjectType } from "@/lib/types";

type Props = {
  projectType: ProjectType;
  selected: string[];
  onChange: (modules: string[]) => void;
};

export default function StepModules({ projectType, selected, onChange }: Props) {
  const modules =
    projectType === "ecommerce" ? ECOMMERCE_MODULES : INFOSITE_MODULES;

  function handleCheck(id: string, checked: boolean | "indeterminate") {
    // RESEARCH.md Pitfall 4 — type-guard onCheckedChange callback
    if (checked === true) {
      onChange([...selected, id]);
    } else {
      onChange(selected.filter((m) => m !== id));
    }
  }

  return (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Модулі</h2>
      <p className="text-base text-muted-foreground mb-4">
        Оберіть модулі, які потрібно протестувати
      </p>
      <div className="space-y-3">
        {modules.map((m) => (
          <div
            key={m.id}
            onClick={() => handleCheck(m.id, !selected.includes(m.id))}
            className={cn(
              "flex items-center space-x-3 min-h-[44px] border rounded-md p-4 cursor-pointer transition-colors",
              selected.includes(m.id)
                ? "border-primary bg-card"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <Checkbox
              id={m.id}
              checked={selected.includes(m.id)}
              onCheckedChange={(checked) => handleCheck(m.id, checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-base text-foreground">{m.label}</span>
          </div>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-sm text-muted-foreground mt-3">
          Оберіть хоча б один модуль зі списку вище
        </p>
      )}
    </div>
  );
}
