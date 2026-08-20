import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CVProvider } from "@/providers/cv-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creador de CV - Crea tu Currículum Profesional y Optimizado para ATS",
  description: "Crea tu currículum perfecto en minutos. Sin complicaciones de diseño, optimizado para pasar filtros ATS y con exportación a PDF de alta calidad.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <CVProvider>{children}</CVProvider>
      </body>
    </html>
  );
}
