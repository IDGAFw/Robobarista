// src/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 py-10 text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:items-start md:gap-6">
        
        {/* Логотип / Название */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xl font-bold text-white font-mono hover:text-zinc-200 transition-colors duration-300 cursor-default">
            RoboBarista
          </span>
          <p className="mt-2 text-sm text-zinc-400">Будущее кофе уже здесь.</p>
        </div>

        {/* Навигация */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm md:gap-6">
          <a href="#" className="transition-all duration-300 hover:text-white hover:-translate-y-0.5">О нас</a>
          <a href="#" className="transition-all duration-300 hover:text-white hover:-translate-y-0.5">Контакты</a>
        </nav>

        {/* Копирайт */}
        <div className="text-sm text-center md:text-right text-zinc-500">
          © {new Date().getFullYear()} RoboBarista.<br className="md:hidden" /> Все права защищены.
        </div>
        
      </div>
    </footer>
  );
}