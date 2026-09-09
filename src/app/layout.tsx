import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { getDictionary, getLocale } from "@/lib/i18n";
import "./globals.css";

const serif = Fraunces({
  variable: "--font-serif-display",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-sans-body",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <LocaleProvider locale={locale}>
          <Header locale={locale} />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-5 sm:py-8">
            {children}
          </main>
          <Footer locale={locale} />
        </LocaleProvider>
      </body>
    </html>
  );
}
