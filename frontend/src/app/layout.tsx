import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airfare APIx · India",
  description: "Real-time domestic airfare index prototype for SIH26056.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
