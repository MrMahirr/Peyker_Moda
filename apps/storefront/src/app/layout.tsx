import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { FavoritesProvider } from "@/lib/FavoritesContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peyker Moda | Kadın Giyim & Aksesuar",
  description: "Zarif kadın giyim, aksesuar ve en yeni moda trendleri. Ücretsiz kargo ve kolay iade.",
  keywords: "kadın giyim, elbise, aksesuar, moda, online alışveriş, peyker moda",
  icons: {
    icon: "/peykermodalogo.png",
    apple: "/peykermodalogo.png",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://peykermoda.com"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Peyker Moda | Kadın Giyim & Aksesuar",
    description: "Zarif kadın giyim, aksesuar ve en yeni moda trendleri. Ücretsiz kargo ve kolay iade.",
    url: "https://peykermoda.com",
    siteName: "Peyker Moda",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Peyker Moda - Elegant Women's Fashion",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Peyker Moda | Kadın Giyim & Aksesuar",
    description: "Zarif kadın giyim, aksesuar ve en yeni moda trendleri. Ücretsiz kargo ve kolay iade.",
    images: ["/og-image.png"],
    creator: "@peykermoda",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "name": "Peyker Moda",
    "url": "https://peykermoda.com",
    "logo": "https://peykermoda.com/logo.png",
    "description": "Zarif kadın giyim, aksesuar ve en yeni moda trendleri. Ücretsiz kargo ve kolay iade.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90-555-000-0000",
      "contactType": "customer service",
      "areaServed": "TR",
      "availableLanguage": "Turkish"
    },
    "sameAs": [
      "https://www.instagram.com/peykermoda",
      "https://twitter.com/peykermoda"
    ]
  };

  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CartProvider>
          <FavoritesProvider>
            {children}
            <Toaster position="top-right" richColors />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}

