import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import Header from "@/components/features/Header";
import ScrollUpButton from "@/components/atoms/ScrollUpButton";
import Footer from "@/components/features/Footer";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";
import Script from 'next/script';
import { defaultMetadata } from "@/lib/seo/metadata";

const geistSans = Cairo({
  variable: "--cairo",
  subsets: ["arabic"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body
        className={`${geistSans.variable}  antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
           
            <Header />
            {children}
            <Script src="https://red3.paysky.io:3011/LB/js/Lightbox.js"
                      strategy="afterInteractive"
            />
            <Toaster position="top-right"/>
            <ScrollUpButton />
            <Footer />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
