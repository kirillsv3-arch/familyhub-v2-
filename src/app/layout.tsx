import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BottomNavigation } from "@/components/BottomNavigation";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "FamilyHub",
  description: "Private app for your family",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider>
          <div className="mx-auto max-w-md min-h-screen border-x border-zinc-200 dark:border-zinc-800 shadow-xl relative pb-20">
            {children}
            <BottomNavigation />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
