import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import Providers from "@/components/Providers";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "ระบบฐานข้อมูลตัวชี้วัด Clinic Governance",
  description: "ระบบติดตามตัวชี้วัดคุณภาพทางคลินิก (Clinical Governance)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
