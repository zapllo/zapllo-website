import type { Metadata } from "next";
import { DM_Sans, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

import { FloatingNavbar } from "@/components/globals/navbar";

const inter = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zapllo - Home",
  description: "Supercharge your Workflow with Zapllo and unleash the power of AI and Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {/* <FloatingNavbar /> */}
        <body className={inter.className}>{children}</body>
      </ThemeProvider>
    </html>
  );
}
