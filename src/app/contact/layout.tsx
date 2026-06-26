import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Directory | TattoosMap",
  description: "Get in touch with the TattoosMap editorial, support, and artist relations teams.",
  alternates: {
    canonical: "https://tattoosmap.com/contact",
  },
  openGraph: {
    title: "Contact Directory | TattoosMap",
    description: "Get in touch with the TattoosMap editorial, support, and artist relations teams.",
    url: "https://tattoosmap.com/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
