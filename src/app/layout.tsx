import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { ToastProvider } from "@/components/ui/Toast";
import LayoutWrapper from "@/components/ui/LayoutWrapper";
import LoginModal from "@/components/ui/LoginModal";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tattoosmap — Discover Tattoo Designs",
  description: "Browse thousands of tattoo designs and find your next tattoo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ModalProvider>
            <ToastProvider>
              <SmoothScrollProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <LoginModal />
              </SmoothScrollProvider>
            </ToastProvider>
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
