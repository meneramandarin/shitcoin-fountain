import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Buenard } from "next/font/google";

const buenard = Buenard({ subsets: ["latin"], weight: ["400", "700"] });
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Shitcoin Fountain",
  description: "Yeet your garbage tokens into the magical wishing well.",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: [
      { url: "/fountain.png", type: "image/png", sizes: "32x32" },
      { url: "/fountain.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/fountain.png",
  },
  openGraph: {
    title: "Shitcoin Fountain",
    description: "Yeet your garbage tokens into the magical wishing well.",
    url: baseUrl,
    siteName: "Shitcoin Fountain",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Shitcoin Fountain preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shitcoin Fountain",
    description: "Yeet your garbage tokens into the magical wishing well.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={buenard.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
