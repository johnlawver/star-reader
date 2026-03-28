import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Star Reader",
  description: "Track reading progress and earn stars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
