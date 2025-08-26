import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "🏆 The Apex Gauntlet",
  description: "IEEE Game Round 1 - Mind Mashup Challenge",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "🏆 The Apex Gauntlet",
    description: "Compete in IEEE’s Mind Mashup Challenge",
    siteName: "The Apex Gauntlet",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
       
      </body>
    </html>
  );
}
