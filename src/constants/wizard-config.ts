import type { WizardState } from "@/lib/types";

// ── Platform Options ────────────────────────────────────────────

export const ECOMMERCE_PLATFORMS = [
  { value: "woocommerce", label: "WooCommerce" },
  { value: "shopify",     label: "Shopify" },
  { value: "other",       label: "Інша платформа" },
] as const;

export const INFOSITE_PLATFORMS = [
  { value: "wordpress", label: "WordPress" },
  { value: "other",     label: "Інша платформа" },
] as const;

// ── Module Options ──────────────────────────────────────────────

export const ECOMMERCE_MODULES = [
  { id: "catalog",  label: "Каталог товарів" },
  { id: "product",  label: "Сторінка товару" },
  { id: "cart",     label: "Кошик" },
  { id: "checkout", label: "Checkout" },
  { id: "auth",     label: "Особистий кабінет" },
  { id: "blog",     label: "Блог" },
  { id: "search",   label: "Пошук" },
  { id: "filter",   label: "Фільтрація" },
  { id: "compare",  label: "Порівняння товарів" },
  { id: "wishlist", label: "Список бажань" },
] as const;

export const INFOSITE_MODULES = [
  { id: "blog",         label: "Блог" },
  { id: "search",       label: "Пошук" },
  { id: "contact-form", label: "Контактна форма" },
  { id: "subscription", label: "Підписка на розсилку" },
  { id: "gallery",      label: "Галерея" },
  { id: "multilang",    label: "Багатомовність" },
  { id: "auth",         label: "Особистий кабінет" },
] as const;

// ── Detail Step Trigger Lists ───────────────────────────────────

export const ECOM_DETAIL_MODULES = ["checkout", "auth", "search"] as const;
export const INFO_DETAIL_MODULES = ["contact-form", "multilang"] as const;

// ── Step Logic Helpers ──────────────────────────────────────────

export function hasDetailStep(state: WizardState): boolean {
  if (!state.projectType || state.modules.length === 0) return false;
  const triggers =
    state.projectType === "ecommerce" ? ECOM_DETAIL_MODULES : INFO_DETAIL_MODULES;
  return state.modules.some((m) => (triggers as readonly string[]).includes(m));
}

export function getTotalSteps(state: WizardState): number {
  return hasDetailStep(state) ? 4 : 3;
}

// ── Generation Constants ────────────────────────────────────────

/**
 * Maps each module ID to the list of TC-prefix strings used in
 * data/test-cases/*.json for that module.
 * Modules without a dedicated JSON file map to an empty array.
 * checkout maps to TC-CHK only; TC-CPN is handled separately via PROMO_TC_PREFIX.
 */
export const MODULE_TC_PREFIXES: Record<string, string[]> = {
  catalog:        ["TC-CAT"],
  product:        ["TC-PDP"],
  cart:           ["TC-CART"],
  checkout:       ["TC-CHK"],
  auth:           ["TC-AUTH"],
  blog:           ["TC-BLOG"],
  search:         ["TC-SRCH"],
  filter:         [],
  compare:        [],
  wishlist:       [],
  "contact-form": ["TC-FORM"],
  subscription:   [],
  gallery:        [],
  multilang:      ["TC-LANG"],
} as const;

/**
 * TC prefix for promo-code test cases.
 * Added to checkout module results when state.checkoutDetails.hasPromoCode === true.
 */
export const PROMO_TC_PREFIX = "TC-CPN" as const;

/**
 * Maps each module ID to its Ukrainian display name.
 * Values are the same label strings used in ECOMMERCE_MODULES / INFOSITE_MODULES.
 */
export const MODULE_DISPLAY_NAMES: Record<string, string> = {
  catalog:        "Каталог товарів",
  product:        "Сторінка товару",
  cart:           "Кошик",
  checkout:       "Checkout",
  auth:           "Особистий кабінет",
  blog:           "Блог",
  search:         "Пошук",
  filter:         "Фільтрація",
  compare:        "Порівняння товарів",
  wishlist:       "Список бажань",
  "contact-form": "Контактна форма",
  subscription:   "Підписка на розсилку",
  gallery:        "Галерея",
  multilang:      "Багатомовність",
} as const;
