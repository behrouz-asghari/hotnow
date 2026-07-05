import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotNow AI | دیدبان هوشمند ترندهای فارسی",
  description: "تحلیل لحظه‌ای و چندبعدی روندهای اجتماعی، اقتصادی و رفتاری جامعه ایرانی با بهره‌گیری از هوش مصنوعی و داده‌های باز.",
  keywords: ["ترندهای روز", "تحلیل داده", "هوش مصنوعی", "رفتارشناسی مصرف‌کننده", "ترندهای گوگل", "نی‌نی‌سایت"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-[#0f172a] text-[#f1f5f9] min-h-screen antialiased">{children}</body>
    </html>
  );
}
