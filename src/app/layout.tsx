import type { Metadata } from "next";
import { Lato, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import NextTopLoader from 'nextjs-toploader';
import Script from "next/script";

const inter = Lato({ weight: "400", subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Zapllo - Automate and Upgrade your Business by 10x",
  description: "Supercharge your Workflow with Zapllo and unleash the power of AI and Automation. Book your free demo now.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive" // Ensures the script loads before your app's JavaScript
          async
        />
      </head>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {/* <FloatingNavbar /> */}
        <body className={inter.className}>
          <NextTopLoader />
          {children}
        </body>
      </ThemeProvider>

    </html>
  );
}
