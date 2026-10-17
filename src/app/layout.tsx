import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideMitra | Share journeys across India",
  description: "Discover and coordinate journeys across India with RideMitra.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
