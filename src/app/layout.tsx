import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Temporary inline AuthProvider wrapper to avoid type issues
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  try {
    const { AuthProvider } = require("@/hooks/use-auth");
    return React.createElement(AuthProvider, null, children);
  } catch {
    return <>{children}</>;
  }
};

export const metadata: Metadata = {
  title: "PAŞA Servis Takip ve Yönetim Sistemi",
  description: "PAŞA İLETİŞİM VE BİLGİSAYAR için geliştirilmiş servis takip ve yönetim sistemi",
  keywords: ["PAŞA", "Servis Takip", "Teknik Servis", "Bilgisayar", "Telefon"],
  authors: [{ name: "PAŞA İLETİŞİM VE BİLGİSAYAR" }],
  openGraph: {
    title: "PAŞA Servis Takip ve Yönetim Sistemi",
    description: "Teknik servis yönetim sistemi",
    url: "https://pasa.com",
    siteName: "PAŞA Servis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PAŞA Servis Takip ve Yönetim Sistemi",
    description: "Teknik servis yönetim sistemi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthWrapper>
            {children}
          </AuthWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
