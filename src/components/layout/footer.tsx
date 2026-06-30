// src/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 py-10 text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        
        {/* Логотип / Название */}
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xl font-bold text-white font-mono">RoboBarista</span>
          <p className="mt-2 text-sm">Будущее кофе уже здесь.</p>
        </div>

        {/* Навигация */}
        <nav className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition-colors">О нас</a>
          <a href="#" className="hover:text-white transition-colors">Доставка</a>
          <a href="#" className="hover:text-white transition-colors">Контакты</a>
        </nav>

        {/* Копирайт */}
        <div className="text-sm">
          © {new Date().getFullYear()} RoboBarista. Все права защищены.
        </div>
        
      </div>
    </footer>
  );
}