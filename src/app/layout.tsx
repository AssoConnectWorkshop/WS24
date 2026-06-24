import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Sidebar />
        <div className="ml-64 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
