import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const serif = Fraunces({
  variable: "--font-serif-display",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-sans-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levanbook",
  description: "Digitaliza PDFs y hojéalos como un libro. Biblioteca personal y enlaces para compartir.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 sm:px-5 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
