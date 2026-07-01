// src/components/Footer.tsx
import Link from 'next/link';


function KiroLogo({ className }: { className?: string }) {
return (
    <div className={`relative inline-block ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="100%" height="100%">
        <defs>

          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          

          <linearGradient id="silver-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4F4F5" />
            <stop offset="100%" stopColor="#E4E4E7" />
          </linearGradient>
        </defs>


        <g fill="#E4E4E7" stroke="#D4D4D8" strokeWidth="1.5">
          <rect x="134" y="10" width="8" height="22" rx="4" />
          <rect x="156" y="10" width="8" height="22" rx="4" />
          <rect x="178" y="10" width="8" height="22" rx="4" />
        </g>


        <rect x="36" y="90" width="10" height="54" rx="5" fill="url(#silver-body)" stroke="#D4D4D8" strokeWidth="1.5" />
        <rect x="40" y="96" width="2" height="42" rx="1" fill="#FFFFFF" opacity="0.8" />


        <rect x="274" y="90" width="10" height="54" rx="5" fill="url(#silver-body)" stroke="#D4D4D8" strokeWidth="1.5" />
        <rect x="278" y="96" width="2" height="42" rx="1" fill="#FFFFFF" opacity="0.8" />


        <rect x="56" y="48" width="208" height="136" rx="44" fill="url(#silver-body)" stroke="#CBD5E1" strokeWidth="2" />
        

        <rect x="64" y="56" width="192" height="120" rx="36" fill="none" stroke="#E4E4E7" strokeWidth="3" />


        <g fill="#D4D4D8">
          <rect x="136" y="58" width="6" height="14" rx="3" opacity="0.7" />
          <rect x="157" y="58" width="6" height="14" rx="3" opacity="0.7" />
          <rect x="178" y="58" width="6" height="14" rx="3" opacity="0.7" />
        </g>


        <g fill="none" strokeLinecap="round">

          <path d="M 98 126 A 18 18 0 0 1 138 126" stroke="#00D2FF" strokeWidth="7" filter="url(#neon-glow)" opacity="0.9" />

          <path d="M 98 126 A 18 18 0 0 1 138 126" stroke="#FFFFFF" strokeWidth="3" />


          <path d="M 182 126 A 18 18 0 0 1 222 126" stroke="#00D2FF" strokeWidth="7" filter="url(#neon-glow)" opacity="0.9" />

          <path d="M 182 126 A 18 18 0 0 1 222 126" stroke="#FFFFFF" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 py-10 text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:items-start md:gap-6">
        
        {/* Логотип / Название */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <KiroLogo className="h-16 w-16 shrink-0 text-zinc-900 sm:h-18 sm:w-18" />
          <span className="font-extrabold text-2xl tracking-tight">KIRO</span>
          <p className="mt-2 text-sm text-zinc-400">Будущее кофе уже здесь.</p>
        </div>

        {/* Навигация */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm md:gap-6">
          <Link 
            href="/about" 
            className="text-muted-foreground transition-all duration-300 hover:text-foreground hover:-translate-y-0.5 focus:outline-none focus:text-foreground"
          >
            О нас
          </Link>
          <Link 
          href="/contacts" 
          className="transition-all duration-300 hover:text-white hover:-translate-y-0.5">
            Контакты
          </Link>
        </nav>

        {/* Копирайт */}
        <div className="text-sm text-center md:text-right text-zinc-500">
          © {new Date().getFullYear()} RoboBarista.<br className="md:hidden" /> Все права защищены.
        </div>
        
      </div>
    </footer>
  );
}