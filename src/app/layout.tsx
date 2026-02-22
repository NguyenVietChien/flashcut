import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flashcut.ai"),
  title: {
    default: "FlashCut.ai — AI Video Automation cho CapCut",
    template: "%s | FlashCut.ai",
  },
  description:
    "Biến ý tưởng thành video CapCut chuyên nghiệp trong 2 phút. AI tự động tạo video nhanh gấp 60x.",
  keywords: [
    "FlashCut",
    "CapCut",
    "AI Video",
    "Video Automation",
    "MMO",
    "TikTok",
    "Video Editor",
    "YouTube Automation",
    "AI Content Creator",
  ],
  authors: [{ name: "FlashCut.ai" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "FlashCut.ai — AI Video Automation cho CapCut",
    description:
      "Biến ý tưởng thành video CapCut chuyên nghiệp trong 2 phút.",
    url: "https://flashcut.ai",
    siteName: "FlashCut.ai",
    type: "website",
    locale: "vi_VN",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashCut.ai — AI Video Automation cho CapCut",
    description:
      "Biến ý tưởng thành video CapCut chuyên nghiệp trong 2 phút. AI tự động tạo video nhanh gấp 60x.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
