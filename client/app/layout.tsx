import "./globals.css";
import type { Metadata, Viewport } from "next";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AdaptEd — Lectures that talk back",
    template: "%s · AdaptEd",
  },
  description:
    "AdaptEd turns static teaching into a real-time conversation with an AI lecturer. Built at LA Hacks 2024 — first place in the Google Gemini Challenge and Fetch.ai's Agentified Winners prize.",
  applicationName: "AdaptEd",
  authors: [{ name: "Bill Zhang", url: "https://github.com/IdkwhatImD0ing" }],
  keywords: [
    "AdaptEd",
    "AI lecturer",
    "conversational learning",
    "LA Hacks 2024",
    "Google Gemini",
    "Fetch.ai",
    "Retell AI",
    "interactive tutoring",
  ],
  category: "education",
  openGraph: {
    type: "website",
    title: "AdaptEd — Lectures that talk back",
    description:
      "Conversational learning. The slides change as you ask. The pace bends to you. LA Hacks 2024 Google Gemini Challenge first place.",
    siteName: "AdaptEd",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "AdaptEd — Lectures that talk back",
    description:
      "Conversational learning, originally built at LA Hacks 2024. Frontend showcase of the Google Gemini Challenge winner.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
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
