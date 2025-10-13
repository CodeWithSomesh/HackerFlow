import type { Metadata } from "next";
import { Black_Ops_One, Roboto_Mono, Geist, Bebas_Neue, Anton } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { NavbarGate, FooterGate } from "@/components/layout-gates";
import { Toaster } from 'react-hot-toast';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HackerFlow",
  description: "The Ultimate Hackathon Web App",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const blackOps = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-blackops",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${blackOps.variable} ${bebas.variable} ${anton.variable} ${robotoMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          
          <div className="relative z-10">
            <NavbarGate />
            {children}
            <FooterGate />
          </div>
          <Toaster
            position="top-right"
            containerClassName="!z-[99999]"
            toastOptions={{
              duration: 4000,
              className: '!z-[99999]',
            }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
