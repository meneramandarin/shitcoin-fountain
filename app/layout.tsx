import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Buenard } from "next/font/google";

const buenard = Buenard({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Shitcoin Fountain",
  description: "Rid yourself of dust. Throw it in the wishing well.",
  icons: {
    icon: "/fountain.png",
  },
  openGraph: {
    images: "/preview.png",
  },
  twitter: {
    card: "summary_large_image",
    images: "/preview.png",
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
