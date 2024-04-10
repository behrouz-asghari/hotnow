
import type { Metadata } from "next";
import "./globals.css";
import './assets/fonts.css';




export const metadata: Metadata = {
  title: "Wiki & Google Trends Dashboard",
  description: "Trending Wikipedia & Google searches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
      >
        {children}
      </body>
    </html>
  );
}
