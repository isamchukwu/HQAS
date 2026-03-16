import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Quotation System",
  description: "Internal quotation management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  );
}
