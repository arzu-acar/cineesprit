import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { VirtualPageviewTracker } from "@components/analytics/VirtualPageviewTracker";
import { IosZoomPreventer } from "@components/IosZoomPreventer";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cineesprit.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "CineEsprit",
    template: "%s — CineEsprit",
  },
  description: "Bağımsız sinema, auteur ve deneysel film platformu",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    siteName: "CineEsprit",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "CineEsprit — Bağımsız Sinema Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.png"],
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "tr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body className="min-h-full flex flex-col bg-ce-bg text-ce-text">
        <IosZoomPreventer />
        <NextIntlClientProvider messages={messages}>
          <VirtualPageviewTracker
            isLoggedIn={!!user}
            userId={user?.id ?? ""}
          />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#141414",
                color: "#ffffff",
                border: "1px solid #2a2a2a",
                fontFamily: "var(--font-ibm-plex-mono)",
                fontSize: "12px",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
