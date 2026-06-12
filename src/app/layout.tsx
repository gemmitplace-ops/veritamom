import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Veritamom — The Gold Standard in Maternal Intelligence",
    template: "%s | Veritamom",
  },
  description:
    "Evidence-based answers to pregnancy and motherhood questions, backed by peer-reviewed research. Trusted by mothers worldwide.",
  keywords: [
    "maternal health", "pregnancy safety", "pregnancy research", "motherhood",
    "breastfeeding", "postpartum", "trimester guide", "evidence-based pregnancy",
    "safe medications pregnancy", "pregnancy nutrition",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Veritamom — The Gold Standard in Maternal Intelligence",
    description: "Evidence-based answers to pregnancy and motherhood questions, backed by peer-reviewed research.",
    type: "website",
    url: "https://veritamom.com",
    siteName: "Veritamom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://veritamom.com",
    languages: {
      en: "https://veritamom.com/en",
      zh: "https://veritamom.com/zh",
      ko: "https://veritamom.com/ko",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased bg-brand-cream dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
