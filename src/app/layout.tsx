import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finvx - Your Financial Universe",
  description: "A comprehensive fintech dashboard for managing your finances.",
};

// Check if Clerk keys are configured
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_your_key_here';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // If Clerk keys are not configured, render without ClerkProvider
  if (!hasClerkKeys) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  // Render with ClerkProvider if keys are configured
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#10b981", // Emerald-500 matches app theme
          colorBackground: "#09090b", // Zinc-950
          colorInputBackground: "#18181b", // Zinc-900
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa", // Zinc-400
        },
        elements: {
          card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white",
          socialButtonsBlockButtonText: "text-white",
          formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
          footerActionLink: "text-emerald-500 hover:text-emerald-400",
          userButtonPopoverCard: "bg-zinc-900 border border-zinc-800 shadow-2xl",
          userPreviewMainIdentifier: "text-white font-semibold",
          userPreviewSecondaryIdentifier: "text-zinc-400",
          userButtonTrigger: "focus:shadow-none",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
