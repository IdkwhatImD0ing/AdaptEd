import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdaptEd — Conversational learning",
  description:
    "Lectures that talk back. AdaptEd turns static teaching into a conversation with an AI lecturer that adapts in real time. Originally built at LA Hacks 2024.",
  metadataBase: new URL("https://adapted.example.com"),
  openGraph: {
    title: "AdaptEd",
    description:
      "Conversational learning. Lectures that talk back. LA Hacks 2024 Google sponsor track winner.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
