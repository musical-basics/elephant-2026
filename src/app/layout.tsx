import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elephant V1.0",
  description: "How do you eat an elephant? One bite at a time.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          background: "var(--bg-primary)",
          margin: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
