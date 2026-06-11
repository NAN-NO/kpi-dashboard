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
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${prompt.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden w-full`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
