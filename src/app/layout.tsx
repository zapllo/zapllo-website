import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import LoaderLayout from "@/components/globals/multi-step-loader";


const inter = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zapllo - Automate and Upgrade your Workflow by 10x",
  description: "Supercharge your Workflow with Zapllo and unleash the power of AI and Automation. Book your free demo now.",
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
