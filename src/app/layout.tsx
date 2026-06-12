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
  metadataBase: new URL("https://tattoosmap.com"),
  title: "TattoosMap — Find Your Perfect Tattoo Design",
  description: "Browse thousands of curated tattoo designs, discover meaning, and connect with verified artists.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tattoosmap.com",
    siteName: "TattoosMap",
    title: "TattoosMap — Discover Your Perfect Tattoo",
    description: "Browse thousands of curated tattoo designs, discover meaning, and connect with verified artists.",
    images: [
      {
        url: "/brand-logo.png",
        width: 1200,
        height: 630,
        alt: "TattoosMap Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TattoosMap — Discover Your Perfect Tattoo",
    description: "Browse thousands of curated tattoo designs, discover meaning, and connect with verified artists.",
    images: ["/brand-logo.png"],
  },
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
