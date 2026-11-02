import az from "./az";
import en from "./en";
import ru from "./ru";

export const locales = ["az", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "az";

const dictionaries = { az, en, ru };

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const getDictionary = (locale: Locale) => dictionaries[locale];

export type { Dictionary } from "./az";
