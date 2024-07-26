import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "P5.js Grid Control Panel",
  description: "Interactive P5.js grid control panel with custom libraries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js" strategy="beforeInteractive" />
        <Script src="/libs/p5.riso.js" strategy="beforeInteractive" />
        <Script src="/libs/p5.pattern.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}