import React from "react"
import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";

import "./globals.css";

const _lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const _inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "El Diccionario - Juego Multijugador",
  description:
    "Inventa definiciones, engana a tus amigos y adivina la verdadera. El clasico juego del diccionario, ahora online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
