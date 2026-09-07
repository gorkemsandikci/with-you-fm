import type { Metadata } from "next";
import { Caveat, Fraunces, Share_Tech_Mono, Special_Elite } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
});

const typewriter = Special_Elite({
  variable: "--font-type",
  weight: "400",
  subsets: ["latin"],
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin", "latin-ext"],
});

const mono = Share_Tech_Mono({
  variable: "--font-mono",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WITH YOU FM",
  description: "Keyif yalniz gitmez. A small internet radio for moods.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${typewriter.variable} ${hand.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
