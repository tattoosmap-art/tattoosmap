import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtual Tattoo Try-On Studio | TattoosMap",
  description: "Upload your photo and virtually try on any tattoo design with pixel-perfect realism.",
  alternates: {
    canonical: "https://tattoosmap.com/try-on",
  },
  openGraph: {
    title: "Virtual Tattoo Try-On Studio | TattoosMap",
    description: "Upload your photo and virtually try on any tattoo design with pixel-perfect realism.",
    url: "https://tattoosmap.com/try-on",
    type: "website",
  },
};

export default function TryOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
