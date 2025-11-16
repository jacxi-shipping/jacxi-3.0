import type { Metadata } from "next";
import { Inter, Urbanist } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JACXI Shipping - Vehicle Shipping from USA to Afghanistan via UAE",
  description: "Professional vehicle shipping from USA through Dubai UAE to Herat and all Afghan provinces. Complete door-to-door service with customs clearance, insurance, and tracking. Serving Kabul, Kandahar, Mazar-i-Sharif and more.",
  keywords: "vehicle shipping USA to Afghanistan, car shipping to Herat, USA to UAE to Afghanistan, vehicle transport Kabul, Jacxi Shipping, Afghanistan car import",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${urbanist.variable}`} dir="ltr">
      <body className="min-h-screen bg-background antialiased" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
