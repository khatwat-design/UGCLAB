import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGCLab - منصة الربط بين المبدعين والمعلنين",
  description: "أول منصة عراقية تربط صناع المحتوى بالمعلنين",
  icons: {
    icon: "/icon.PNG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
