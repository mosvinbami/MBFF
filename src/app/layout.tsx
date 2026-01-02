import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MBFF - Mosvin Bami Fantasy Football",
  description: "The ultimate multi-league fantasy football experience. Build your dream team from 5 top European leagues.",
  keywords: ["fantasy football", "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"],
  authors: [{ name: "MBFF Team" }],
  openGraph: {
    title: "MBFF - Mosvin Bami Fantasy Football",
    description: "The ultimate multi-league fantasy football experience",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
