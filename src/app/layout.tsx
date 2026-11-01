import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Mrs_Saint_Delafield, Syne } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const syne = Syne({ variable: "--font-syne", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const signature = Mrs_Saint_Delafield({ variable: "--font-signature-face", subsets: ["latin"], weight: "400" });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
};

// The site is dark-only (Joker palette); the `dark` class keeps dark: variants consistent.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${geistMono.variable} ${syne.variable} ${instrument.variable} ${signature.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
