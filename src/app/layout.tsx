import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Veritamom",
    template: "%s | Veritamom",
  },
  description:
    "Evidence-based support for every stage of your motherhood journey. Research, community, and tracking tools — all in one trusted place.",
  keywords: ["maternal health", "pregnancy", "motherhood", "research", "parenting"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Veritamom",
    description: "Evidence-based support for every stage of your motherhood journey.",
    type: "website",
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
