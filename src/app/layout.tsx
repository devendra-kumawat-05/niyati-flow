import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

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
    <html lang="en">
      <body className={cn("min-h-screen bg-background antialiased")}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
