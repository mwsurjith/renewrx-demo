import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PregnancyProvider } from "@/context/pregnancy-context";
import NotificationToast from "@/components/ui/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { DeveloperProvider } from "@/context/developer-context";

export const metadata = {
  title: "RenewRx",
  description: "Your prenatal health companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-neutral-200 w-full flex justify-center h-dvh overflow-hidden font-sans ${geistSans.variable} ${geistMono.variable}`}>
        {/* Mobile Container / App Shell */}
        <div className="relative flex flex-col w-full max-w-md h-full bg-white overflow-hidden">
          <DeveloperProvider>
            <PregnancyProvider>
              {children}
            </PregnancyProvider>
            <NotificationToast />
          </DeveloperProvider>
        </div>
      </body>
    </html>
  );
}
