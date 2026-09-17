import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/shared/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NutriVision AI — Personal Nutrition Coach",
    template: "%s · NutriVision AI",
  },
  description:
    "AI-powered nutrition coach: snap a photo of your meal for instant calorie & macro breakdowns, chat with an AI nutritionist, and generate personalized recipes from your ingredients.",
  keywords: ["nutrition app", "AI diet coach", "calorie tracker", "food analysis AI", "recipe generator"],
  openGraph: {
    title: "NutriVision AI — Personal Nutrition Coach",
    description:
      "Snap a photo of your meal for instant nutrition analysis, chat with an AI nutritionist, and get personalized recipes.",
    siteName: "NutriVision AI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NutriVision AI — Personal Nutrition Coach",
    description: "AI-powered nutrition coach with food photo analysis, chat, and recipe generation.",
  },
};

export const viewport: Viewport = {
  themeColor: "#006c49",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
