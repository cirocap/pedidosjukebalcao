import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juke Bar - Sistema de Pedidos",
  description: "Sistema de pedidos do Juke Bar - Balcão e Cozinha",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
