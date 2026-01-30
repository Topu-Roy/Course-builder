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
    default: "Course Builder | Create and Manage Online Courses",
    template: "%s | Course Builder",
  },
  description:
    "A professional platform for building, managing, and taking online courses. Empowering creators and learners worldwide.",
  keywords: [
    "online courses",
    "learning management system",
    "education",
    "course builder",
    "nextjs",
    "trpc",
    "tailwind",
  ],
  authors: [{ name: "Course Builder Team" }],
  creator: "Course Builder Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://course-builder.example.com", // Replace with actual production URL
    siteName: "Course Builder",
    title: "Course Builder | Create and Manage Online Courses",
    description:
      "A professional platform for building, managing, and taking online courses. Empowering creators and learners worldwide.",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "Course Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Course Builder | Create and Manage Online Courses",
    description: "A professional platform for building, managing, and taking online courses.",
    images: ["/og-image.png"],
    creator: "@coursebuilder",
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
