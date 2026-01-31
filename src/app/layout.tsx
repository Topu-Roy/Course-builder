import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "StudyZap | Create and Manage Online Courses",
    template: "%s | StudyZap",
  },
  description:
    "A professional platform for building, managing, and taking online courses. Empowering creators and learners worldwide.",
  keywords: [
    "online courses",
    "learning management system",
    "education",
    "studyzap",
    "nextjs",
    "trpc",
    "tailwind",
  ],
  authors: [{ name: "StudyZap Team" }],
  creator: "StudyZap Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://studyzap.example.com", // Replace with actual production URL
    siteName: "StudyZap",
    title: "StudyZap | Create and Manage Online Courses",
    description:
      "A professional platform for building, managing, and taking online courses. Empowering creators and learners worldwide.",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "StudyZap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyZap | Create and Manage Online Courses",
    description: "A professional platform for building, managing, and taking online courses.",
    images: ["/og-image.png"],
    creator: "@studyzap",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
