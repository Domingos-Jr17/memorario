import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'sonner'; // Import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memorario - Your Digital Memory Journal",
  description: "Capture and cherish your memories with Memorario, a simple and elegant digital journal.",
  keywords: ["memories", "journal", "diary", "digital", "personal", "app"],
  authors: [{ name: "Your Name" }], // Consider replacing with your name or project name
  creator: "Your Name",
  publisher: "Your Name",
  openGraph: {
    title: "Memorario - Your Digital Memory Journal",
    description: "Capture and cherish your memories with Memorario, a simple and elegant digital journal.",
    url: "https://your-memorario-app.com", // Replace with your deployed URL
    siteName: "Memorario",
    images: [
      {
        url: "https://your-memorario-app.com/og-image.jpg", // Replace with a relevant image for social sharing
        width: 1200,
        height: 630,
        alt: "Memorario App Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memorario - Your Digital Memory Journal",
    description: "Capture and cherish your memories with Memorario, a simple and elegant digital journal.",
    creator: "@yourtwitterhandle", // Replace with your Twitter handle
    images: ["https://your-memorario-app.com/twitter-image.jpg"], // Replace with a relevant image for Twitter
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" richColors /> {/* Add Toaster component */}
      </body>
    </html>
  );
}