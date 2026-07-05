export function normalizeFa(text: string): string {
  return text
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/‌/g, " ") // ZWNJ
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const FA_STOPWORDS = new Set(["از","با","به","در","که","را","و","یا","برای","این","آن"]);

export function tokenizeFa(text: string): string[] {
  return normalizeFa(text)
    .split(" ")
    .filter((t) => t.length > 1 && !FA_STOPWORDS.has(t));
}

export function parsePersianInt(text: string): number {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let clean = text;
  for (let i = 0; i < 10; i++) {
    clean = clean.replace(persianDigits[i], i.toString());
  }
  return parseInt(clean.replace(/[^\d]/g, "")) || 0;
}
