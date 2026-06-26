import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Tattoo Planning Tools | TattoosMap",
  description: "Calculate costs, estimate session times, explore pain maps, and track healing progress with TattoosMap tools.",
  alternates: {
    canonical: "https://tattoosmap.com/tools",
  },
  openGraph: {
    title: "Interactive Tattoo Planning Tools | TattoosMap",
    description: "Calculate costs, estimate session times, explore pain maps, and track healing progress with TattoosMap tools.",
    url: "https://tattoosmap.com/tools",
    type: "website",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
