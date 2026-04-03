import type { Metadata } from "next";
import { Libre_Caslon_Display, Figtree } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import "./globals.css";

const display = Libre_Caslon_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DB Photography | Events, Galleries & Prints",
  description: "Professional photography – events, galleries, and high-quality prints. Cape Town, South Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable}`}>
      <body className="min-h-screen font-sans antialiased flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
