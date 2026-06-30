import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

// Подключаем шрифт (можно будет заменить на фирменный позже)
const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "RoboBarista | Роботизированная кофейня",
  description: "Закажи свой идеальный кофе через приложение. Готовится роботами, создано для вас.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        {/* Наш новый Header */}
        <Header />
        
        {/* Основной контент страницы (Hero, Каталог и т.д.) */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}