import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // This line will now work

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "🏆 The Apex Gauntlet",
  description: "IEEE Game Round 1 - Mind Mashup Challenge",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}