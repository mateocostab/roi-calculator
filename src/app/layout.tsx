import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calculadora de ROI de CRO | ConvertMate",
  description: "Descubre cuánto revenue adicional puedes generar optimizando tu tasa de conversión. Calcula el ROI de CRO para tu tienda ecommerce.",
  keywords: ["CRO", "conversion rate optimization", "ROI calculator", "ecommerce", "optimización de conversión"],
  authors: [{ name: "ConvertMate" }],
  openGraph: {
    title: "Calculadora de ROI de CRO | ConvertMate",
    description: "Descubre cuánto revenue adicional puedes generar optimizando tu tasa de conversión.",
    type: "website",
  },
};

// Accessibility & Design - viewport configuration
export const viewport: Viewport = {
  themeColor: "#050508", // Match page background
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
