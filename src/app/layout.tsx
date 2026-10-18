import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PushNotificationBanner } from "@/components/PushNotificationBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Bazar da Mudança - Portfólio",
  description: "Portfólio e exemplo de Bazar/vitrine virtual com código gratuito no GitHub. Siga nossas aventuras na Polônia: @oskarasnapolonia",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Bazar da Mudança - Portfólio",
    description: "Portfólio e exemplo de Bazar/vitrine virtual com código gratuito no GitHub. Siga nossas aventuras na Polônia: @oskarasnapolonia",
    url: "https://bazardoskaras.web.app",
    siteName: "Bazar da Mudança",
    images: [
      {
        url: "https://bazardoskaras.web.app/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "Bandeiras do Brasil e da Polônia",
      }
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
        <PushNotificationBanner />
      </body>
    </html>
  );
}
