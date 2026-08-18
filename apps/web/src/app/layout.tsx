import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const noto = Noto_Sans({ subsets: ["latin", "cyrillic"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: "Bayan Burd Eternity — Бизнесийн технологийн портал",
  description:
    "Тоног төхөөрөмж, программ хангамж, веб систем, суурилуулалт, баталгаа, issue tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={`${inter.variable} ${noto.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
