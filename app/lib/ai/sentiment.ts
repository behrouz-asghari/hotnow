import { ClusteredItem, SentimentResult } from "../types";

const fearWords = [
  "بحران",
  "جنگ",
  "زلزله",
  "تحریم",
  "حادثه",
  "درگیری",
  "اعدام",
  "بازداشت",
];

const excitementWords = [
  "رشد",
  "برد",
  "موفقیت",
  "رکورد",
  "جشن",
  "افتتاح",
  "قهرمانی",
];

const sexualInterestWords = [
  "پوزیشن‌های جنسی",
  "آمیزش جنسی",
  "خودارضایی",
  "صنعت سکس",
  "کنش‌های جنسی",
  "وسایل جنسی",
  "پورنوگرافی",
  "سکس‌شناسی",
  "میل جنسی در انسان",
  "جاذبه جنسی",
  "برهنگی",
  "فتیش جنسی",
  "گرایش‌های جنسی",
  "برانگیختگی جنسی",
];

const sexualConcernWords = [
  "دستگاه تولیدمثل زنانه در انسان",
  "تولیدمثل",
  "آلت مردانه",
  "آلت تناسلی نر",
  "تمایلات جنسی",
  "جرایم جنسی",
  "فرج",
  "پستان",
  "باروری",
  "واژن",
  "پزشکی زایمان",
  "ناکارآمدی‌های جنسی",
];

const politicalWords = [
  "مخالفان سیاسی",
  "سیاستمداران مخالف",
  "خانواده پهلوی",
  "دودمان پهلوی",
  "ایران اینترنشنال",
  "اعدام‌شدگان",
  "سانسور اینترنت",
  "تحریم",
  "اعتراضات",
];

export function estimateSentiment(items: ClusteredItem[]): SentimentResult {
  const text = items.map((i) => i.cleanTitle).join(" ");

  const fear = score(text, fearWords);
  const excitement = score(text, excitementWords);
  const sexualInterest = score(text, sexualInterestWords);
  const sexualConcern = score(text, sexualConcernWords);
  const politicalTension = score(text, politicalWords);

  // ادغام سه شاخص جنسی در یک سیگنال واحد
  const sexualSignal = Math.min(
    1,
    Number((sexualInterest * 0.6 + sexualConcern * 0.4).toFixed(2))
  );

  const crisis = Math.min(
    1,
    Number((fear * 0.6 + politicalTension * 0.3 + (1 - excitement) * 0.1).toFixed(2))
  );

  const polarity = Number(
    (excitement - fear - politicalTension * 0.5).toFixed(2)
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

function score(text: string, words: string[]) {
  const count = words.reduce(
    (acc, w) => acc + (text.includes(w) ? 1 : 0),
    0
  );

  return Math.min(1, Number((count / Math.max(1, words.length / 3)).toFixed(2)));
}
