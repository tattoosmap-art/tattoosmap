import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, DM_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LoginModal from "@/components/ui/LoginModal";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import Script from "next/script";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "TattoosMap | Find Your Next Tattoo",
  description: "A minimal tattoo inspiration and culture brand.",
  openGraph: {
    title: "TattoosMap",
    description: "A minimal tattoo inspiration and culture brand.",
    url: "https://tattoosmap.com",
    siteName: "TattoosMap",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TattoosMap",
    description: "A minimal tattoo inspiration and culture brand.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${dmSans.variable} ${playfairDisplay.variable} ${dmMono.variable} antialiased bg-white text-black font-sans selection:bg-brand-red selection:text-white flex flex-col min-h-screen outline-custom`}>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <SmoothScrollProvider>
          <AuthProvider>
            <ModalProvider>
              <ToastProvider>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      '@context': 'https://schema.org',
                      '@graph': [
                        {
                          '@type': 'WebSite',
                          'name': 'TattoosMap',
                          'url': 'https://tattoosmap.com',
                          'potentialAction': {
                            '@type': 'SearchAction',
                            'target': 'https://tattoosmap.com/gallery?q={search_term_string}',
                            'query-input': 'required name=search_term_string'
                          }
                        },
                        {
                          '@type': 'Organization',
                          'name': 'TattoosMap',
                          'url': 'https://tattoosmap.com',
                          'logo': 'https://tattoosmap.com/brand-logo.png',
                          'description': 'The first objective tattoo discovery platform combining a curated design gallery, verified artist directory, interactive tools, and science-backed aftercare guides.',
                          'sameAs': ['https://instagram.com/tattoosmap']
                        }
                      ]
                    })
                  }}
                />
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <LoginModal />
              </ToastProvider>
            </ModalProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

import LayoutWrapper from "@/components/ui/LayoutWrapper";
