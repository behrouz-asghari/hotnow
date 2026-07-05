import { ClusteredItem, SentimentResult } from "../types";

const fearWords = [
  "بحران", "جنگ", "زلزله", "تحریم", "حادثه", "درگیری", "اعدام", "بازداشت",
  "کشتار", "قتل", "فاجعه", "سیل", "آتش‌سوزی", "بمب‌گذاری", "انفجار",
  "ترور", "تهدید", "خوف", "وحشت", "هولناک", "فاجعه‌بار", "مرگ",
  "بیماری", "همه‌گیری", "قحطی", "مهاجرت اجباری", "آوارگی",
  "خودکشی", "خودسوزی", "اعتیاد", "فقر", "بیکاری", "تورم",
];

const excitementWords = [
  "رشد", "برد", "موفقیت", "رکورد", "جشن", "افتتاح", "قهرمانی",
  "پیشرفت", "نبوغ", "کشف", "اختراع", "دستاورد", "جایزه", "مدال",
  "پیروزی", "موفق", "عالی", "فوق‌العاده", "هیجان", "شادی", "خوشحالی",
  "جشنواره", "جایزه بزرگ", "-breakthrough", "تحول", "انقلاب",
];

const sexualInterestWords = [
  "پوزیشن‌های جنسی", "آمیزش جنسی", "خودارضایی", "صنعت سکس",
  "کنش‌های جنسی", "وسایل جنسی", "پورنوگرافی", "سکس‌شناسی",
  "میل جنسی در انسان", "جاذبه جنسی", "برهنگی", "فتیش جنسی",
  "گرایش‌های جنسی", "برانگیختگی جنسی", "رضایت جنسی", "عمل جنسی",
  "لذت جنسی", "ارگاسم", "رابطه جنسی", "تماس جنسی", "نزدیکی جنسی",
  "فیلم سکسی", "صحنه سکسی", "ویدیو سکسی", "فیلم پورنو",
  "پورنو", "سکس", "سکسی", "اروتیک",
];

const sexualConcernWords = [
  "دستگاه تولیدمثل زنانه در انسان", "تولیدمثل", "آلت مردانه",
  "آلت تناسلی نر", "تمایلات جنسی", "جرایم جنسی", "فرج", "پستان",
  "باروری", "واژن", "پزشکی زایمان", "ناکارآمدی‌های جنسی",
  "تجاوز", "آزار جنسی", "سوءاستفاده جنسی", "خشونت جنسی",
  "اختلال جنسی", "مشکل جنسی", "درد جنسی", "بیماری جنسی",
  "عفونت جنسی", "STD", "HIV", "علائم جنسی",
];

const politicalWords = [
  "مخالفان سیاسی", "سیاستمداران مخالف", "خانواده پهلوی", "دودمان پهلوی",
  "ایران اینترنشنال", "اعدام‌شدگان", "سانسور اینترنت", "تحریم", "اعتراضات",
  "تظاهرات", "شورش", "نافرمانی مدنی", "حقوق بشر", "زندانی سیاسی",
  "آزادی بیان", "دموکراسی", "انقلاب", "رژیم", "حاکمیت",
  "اپوزیسیون", "جنبش سبز", "زن زندگی آزادی", "کف روسری",
  "حجاب اجباری", "گشت ارشاد", "سپاه", "بسیج",
];

function countMatches(text: string, words: string[]): number {
  let count = 0;
  for (const w of words) {
    if (text.includes(w)) count++;
  }
  return count;
}

/**
 * TF-like scoring: log(1 + matchCount) / log(1 + totalWords)
 * Normalized by total corpus size, logarithmic scaling prevents
 * repeated words from inflating the score.
 */
function score(text: string, words: string[]): number {
  const matchCount = countMatches(text, words);
  if (matchCount === 0) return 0;
  const totalWords = text.split(/\s+/).length || 1;
  const raw = Math.log(1 + matchCount) / Math.log(1 + totalWords);
  // Scale up slightly so small corpora aren't always near zero
  const scaled = raw * 5;
  return Math.min(1, Number(scaled.toFixed(3)));
}

export function estimateSentiment(items: ClusteredItem[]): SentimentResult {
  const text = items.map((i) => i.cleanTitle).join(" ");

  const fear = score(text, fearWords);
  const excitement = score(text, excitementWords);
  const sexualInterest = score(text, sexualInterestWords);
  const sexualConcern = score(text, sexualConcernWords);
  const politicalTension = score(text, politicalWords);

  const sexualSignal = Math.min(
    1,
    Number((sexualInterest * 0.6 + sexualConcern * 0.4).toFixed(3))
  );

  const crisis = Math.min(
    1,
    Number((fear * 0.6 + politicalTension * 0.3 + (1 - excitement) * 0.1).toFixed(3))
  );

  const polarity = Number(
    (excitement - fear - politicalTension * 0.5).toFixed(3)
  );

  return {
    fear,
    excitement,
    crisis,
    polarity,
    sexualSignal,
    politicalTension,
  };
}
