import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@auth0/nextjs-auth0/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdaptED",
  description:
    "10x your learning through interactive and personalized lectures, powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <UserProvider>
        <body
          className={`${inter.className} h-full`}
          suppressHydrationWarning={true}
        >
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
