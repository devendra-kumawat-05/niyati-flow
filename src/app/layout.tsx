import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCProvider } from "@/components/trpc-provider";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Niyati Flow",
  description: "Niyati Flow - The AI career counsellor chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <TRPCProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster position="top-center" richColors />
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
