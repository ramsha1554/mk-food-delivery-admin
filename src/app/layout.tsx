import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "@/components/shared/providers";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MK Food Delivery — Admin",
  description: "Administrative dashboard for the MK Food Delivery Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
         <Toaster
  position="top-center"
  toastOptions={{
    duration: 3000,
    classNames: {
      toast: "bg-white border border-slate-200 shadow-sm rounded-full px-4 py-2 font-sans",
      title: "text-xs font-medium text-slate-800",
    },
  }}
/>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}