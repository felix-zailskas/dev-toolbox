import { Faker, en, en_GB, de, nl, fr } from "@faker-js/faker";
import { generateAddress } from "./addresses";

export const LOCALES = {
  en_US: { label: "English (US)", locale: en },
  en_GB: { label: "English (UK)", locale: en_GB },
  de_DE: { label: "German", locale: de },
  nl_NL: { label: "Dutch", locale: nl },
  fr_FR: { label: "French", locale: fr },
} as const;

export type LocaleKey = keyof typeof LOCALES;

export const FIELDS = ["uuid", "firstName", "lastName", "email", "street", "city", "zip", "country", "iban"] as const;
export type FieldKey = (typeof FIELDS)[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
  uuid: "UUID",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  street: "Street",
  city: "City",
  zip: "Zip Code",
  country: "Country",
  iban: "IBAN",
};

function createFaker(locale: LocaleKey): Faker {
  return new Faker({ locale: [LOCALES[locale].locale, en] });
}

// --- Real IBAN generation with valid bank codes ---

interface BankDef {
  country: string;
  bankCodes: string[];
  /** Generate BBAN given a bank code and a function that returns N random digits */
  bban: (bankCode: string, rand: (n: number) => string) => string;
}

const randomDigits = (n: number): string =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

// German account number check digit (Methode 00 — most common)
// Positions 1-9, weighted 2,1,2,1,2,1,2,1,2 from left to right,
// sum cross-digits of products, check digit = (10 - sum % 10) % 10
function germanAccountWithCheckDigit(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const product = digits[i] * weights[i];
    // Cross-sum: add individual digits of product
    sum += product >= 10 ? Math.floor(product / 10) + (product % 10) : product;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return digits.join("") + String(checkDigit);
}

// Dutch 11-proef: weights 10,9,8,...,2,1 from left to right, sum divisible by 11
function dutchAccountWithCheckDigit(): string {
  // Generate 9 digits, compute 10th so that weighted sum % 11 === 0
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }
  // Last digit weight is 1, so digit10 = (11 - sum % 11) % 11
  const remainder = sum % 11;
  const lastDigit = (11 - remainder) % 11;
  // If lastDigit is 10, it's invalid (can't be a single digit) — regenerate
  if (lastDigit === 10) return dutchAccountWithCheckDigit();
  return digits.join("") + String(lastDigit);
}

// Real bank codes per country
const BANK_DEFS: Record<string, BankDef> = {
  // DE: 8-digit BLZ + 10-digit account (with Prüfziffer via Methode 00)
  DE: {
    country: "DE",
    bankCodes: [
      "10010010", // Postbank
      "50070010", // Deutsche Bank Frankfurt
      "10070000", // Deutsche Bank Berlin
      "37040044", // Commerzbank Köln
      "50010517", // ING
      "70050000", // Bayerische Landesbank
      "20050550", // Hamburger Sparkasse
      "50050201", // Frankfurter Sparkasse
      "68050101", // Sparkasse Freiburg
      "25050180", // Sparkasse Hannover
    ],
    bban: (blz) => `${blz}${germanAccountWithCheckDigit()}`,
  },
  // GB: 4-letter bank + 6-digit sort code + 8-digit account
  GB: {
    country: "GB",
    bankCodes: [
      "NWBK601613", // NatWest
      "NWBK600000", // NatWest
      "BUKB200415", // Barclays
      "BUKB201486", // Barclays
      "HBUK400515", // HSBC
      "HBUK400162", // HSBC
      "LOYD300002", // Lloyds
      "LOYD309483", // Lloyds
      "MIDL400051", // HSBC (Midland)
      "BOFS801002", // Bank of Scotland
    ],
    bban: (code, rand) => `${code}${rand(8)}`,
  },
  // NL: 4-letter bank + 10-digit account (with 11-proef)
  NL: {
    country: "NL",
    bankCodes: [
      "ABNA", // ABN AMRO
      "INGB", // ING
      "RABO", // Rabobank
      "SNSB", // SNS Bank
      "TRIO", // Triodos
      "ASNB", // ASN Bank
      "KNAB", // Knab
      "BUNQ", // Bunq
    ],
    bban: (code) => `${code}${dutchAccountWithCheckDigit()}`,
  },
  // FR: 5-digit bank + 5-digit branch + 11-char account + 2-digit check key
  FR: {
    country: "FR",
    bankCodes: [
      "30004", // BNP Paribas
      "30006", // Société Générale (CL)
      "30003", // Société Générale
      "10107", // La Banque Postale
      "30002", // Crédit Lyonnais
      "20041", // La Banque Postale
      "17569", // Boursorama
      "30066", // CIC
    ],
    bban: (bank, rand) => {
      const branch = rand(5);
      const account = rand(11);
      // French RIB check: 97 - ((89 * bank + 15 * branch + 3 * account) mod 97)
      const ribKey = 97 - ((89 * Number(bank) + 15 * Number(branch) + 3 * Number(account)) % 97);
      return `${bank}${branch}${account}${String(ribKey).padStart(2, "0")}`;
    },
  },
};

const LOCALE_COUNTRY: Record<LocaleKey, string> = {
  en_US: "GB", // US doesn't use IBAN, fall back to GB
  en_GB: "GB",
  de_DE: "DE",
  nl_NL: "NL",
  fr_FR: "FR",
};

function computeIbanCheckDigits(country: string, bban: string): string {
  // Move country + "00" to end, convert letters to numbers
  const rearranged = bban + country + "00";
  const numeric = rearranged
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      // A=10, B=11, ..., Z=35
      if (code >= 65 && code <= 90) return String(code - 55);
      return c;
    })
    .join("");

  // Mod 97 on large number (process in chunks)
  let remainder = 0;
  for (const char of numeric) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }
  const checkDigits = 98 - remainder;
  return String(checkDigits).padStart(2, "0");
}

function generateIban(locale: LocaleKey): string {
  const countryCode = LOCALE_COUNTRY[locale];
  const def = BANK_DEFS[countryCode];
  const bankCode = def.bankCodes[Math.floor(Math.random() * def.bankCodes.length)];
  const bban = def.bban(bankCode, (n: number) => randomDigits(n));
  const check = computeIbanCheckDigits(def.country, bban);
  return `${def.country}${check}${bban}`;
}

export function generateRecord(
  locale: LocaleKey,
  fields: FieldKey[] = [...FIELDS]
): Record<FieldKey, string> {
  const faker = createFaker(locale);
  const record = {} as Record<FieldKey, string>;

  for (const field of fields) {
    switch (field) {
      case "uuid":
        record.uuid = faker.string.uuid();
        break;
      case "firstName":
        record.firstName = faker.person.firstName();
        break;
      case "lastName":
        record.lastName = faker.person.lastName();
        break;
      case "email":
        record.email = faker.internet.email();
        break;
      case "street":
      case "city":
      case "zip":
      case "country": {
        // Generate address once, fill all requested address fields
        if (!record.street && !record.city && !record.zip && !record.country) {
          const addr = generateAddress(locale);
          if (fields.includes("street")) record.street = addr.street;
          if (fields.includes("city")) record.city = addr.city;
          if (fields.includes("zip")) record.zip = addr.zip;
          if (fields.includes("country")) record.country = addr.country;
        }
        break;
      }
      case "iban":
        record.iban = generateIban(locale);
        break;
    }
  }

  return record;
}

export function generateRecords(
  locale: LocaleKey,
  fields: FieldKey[],
  count: number
): Record<FieldKey, string>[] {
  return Array.from({ length: count }, () => generateRecord(locale, fields));
}
