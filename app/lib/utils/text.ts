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
