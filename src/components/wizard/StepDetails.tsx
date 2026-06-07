"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { WizardState } from "@/lib/types";

type Props = {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
};

export default function StepDetails({ state, onChange }: Props) {
  const { modules } = state;

  return (
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Деталі</h2>
      <p className="text-base text-muted-foreground mb-4">
        Уточніть параметри обраних модулів
      </p>

      {/* E-commerce: Checkout */}
      {modules.includes("checkout") && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground mb-3">Checkout</h3>
          <div className="space-y-3">
            <BooleanCheckbox
              id="hasGuestCheckout"
              label="Чи підтримується гостьовий checkout (без реєстрації)?"
              checked={state.checkoutDetails?.hasGuestCheckout ?? false}
              onCheckedChange={(v) =>
                onChange({
                  checkoutDetails: {
                    hasGuestCheckout: v,
                    hasPromoCode: state.checkoutDetails?.hasPromoCode ?? false,
                  },
                })
              }
            />
            <BooleanCheckbox
              id="hasPromoCode"
              label="Чи є функція промокодів / купонів?"
              checked={state.checkoutDetails?.hasPromoCode ?? false}
              onCheckedChange={(v) =>
                onChange({
                  checkoutDetails: {
                    hasGuestCheckout: state.checkoutDetails?.hasGuestCheckout ?? false,
                    hasPromoCode: v,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* E-commerce: Auth / Особистий кабінет */}
      {modules.includes("auth") && state.projectType === "ecommerce" && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground mb-3">
            Особистий кабінет
          </h3>
          <div className="space-y-3">
            <BooleanCheckbox
              id="hasSocialLogin"
              label="Чи є вхід через соціальні мережі?"
              checked={state.authDetails?.hasSocialLogin ?? false}
              onCheckedChange={(v) =>
                onChange({
                  authDetails: {
                    hasSocialLogin: v,
                    hasOrderHistory: state.authDetails?.hasOrderHistory ?? false,
                  },
                })
              }
            />
            <BooleanCheckbox
              id="hasOrderHistory"
              label="Чи відображається історія замовлень?"
              checked={state.authDetails?.hasOrderHistory ?? false}
              onCheckedChange={(v) =>
                onChange({
                  authDetails: {
                    hasSocialLogin: state.authDetails?.hasSocialLogin ?? false,
                    hasOrderHistory: v,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* E-commerce: Search / Пошук */}
      {modules.includes("search") && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground mb-3">Пошук</h3>
          <div className="space-y-3">
            <BooleanCheckbox
              id="hasAutoComplete"
              label="Чи є автодоповнення у пошуковому рядку?"
              checked={state.searchDetails?.hasAutoComplete ?? false}
              onCheckedChange={(v) =>
                onChange({
                  searchDetails: {
                    hasAutoComplete: v,
                    hasFiltersInResults:
                      state.searchDetails?.hasFiltersInResults ?? false,
                  },
                })
              }
            />
            <BooleanCheckbox
              id="hasFiltersInResults"
              label="Чи є фільтри на сторінці результатів пошуку?"
              checked={state.searchDetails?.hasFiltersInResults ?? false}
              onCheckedChange={(v) =>
                onChange({
                  searchDetails: {
                    hasAutoComplete: state.searchDetails?.hasAutoComplete ?? false,
                    hasFiltersInResults: v,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* Infosite: Contact Form / Контактна форма */}
      {modules.includes("contact-form") && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground mb-3">
            Контактна форма
          </h3>
          <div className="space-y-3">
            <BooleanCheckbox
              id="hasFileUpload"
              label="Чи є завантаження файлів у формі?"
              checked={state.contactFormDetails?.hasFileUpload ?? false}
              onCheckedChange={(v) =>
                onChange({
                  contactFormDetails: {
                    hasFileUpload: v,
                    hasCaptcha: state.contactFormDetails?.hasCaptcha ?? false,
                  },
                })
              }
            />
            <BooleanCheckbox
              id="hasCaptcha"
              label="Чи є захист від спаму (CAPTCHA / reCAPTCHA)?"
              checked={state.contactFormDetails?.hasCaptcha ?? false}
              onCheckedChange={(v) =>
                onChange({
                  contactFormDetails: {
                    hasFileUpload: state.contactFormDetails?.hasFileUpload ?? false,
                    hasCaptcha: v,
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {/* Infosite: Multilang / Багатомовність */}
      {modules.includes("multilang") && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground mb-3">
            Багатомовність
          </h3>
          <p className="text-base text-foreground mb-3">
            Скільки мов підтримує сайт?
          </p>
          <RadioGroup
            value={state.multilangDetails?.languageCount ?? ""}
            onValueChange={(v) =>
              onChange({
                multilangDetails: {
                  languageCount: v as "2" | "3" | "4plus",
                },
              })
            }
            className="space-y-3"
          >
            {(
              [
                { value: "2", label: "2 мови" },
                { value: "3", label: "3 мови" },
                { value: "4plus", label: "4 і більше" },
              ] as const
            ).map((opt) => (
              <div
                key={opt.value}
                onClick={() =>
                  onChange({
                    multilangDetails: {
                      languageCount: opt.value,
                    },
                  })
                }
                className="flex items-center space-x-3 min-h-[44px] border border-border rounded-md p-4 bg-card cursor-pointer"
              >
                <RadioGroupItem
                  value={opt.value}
                  id={`lang-${opt.value}`}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-base text-foreground">{opt.label}</span>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}

// ── Internal helper — not exported ────────────────────────────────────────────

function BooleanCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onCheckedChange(!checked)}
      className="flex items-center space-x-3 min-h-[44px] border border-border rounded-md p-4 bg-card cursor-pointer"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        onClick={(e) => e.stopPropagation()}
      />
      <span className="text-base text-foreground">{label}</span>
    </div>
  );
}
