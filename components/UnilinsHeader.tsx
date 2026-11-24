import Link from "next/link";
import { GraduationCap, Trophy, HelpCircle, Play } from "lucide-react";

export function UnilinsHeader() {
  return (
    <header className="w-full shadow-sm sticky top-0 z-40">
      {/* Barra Superior Institucional */}
      <div className="bg-[#002244] text-slate-200 text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#fbbf24]" />
            <span className="font-medium tracking-wide">
              UNILINS • Centro Universitário de Lins — Portal de Desafios Interativos
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <a
              href="https://unilins.edu.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#fbbf24] transition-colors"
            >
              Site Oficial UNILINS
            </a>
            <span className="text-white/20">|</span>
            <span>Lins – SP</span>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Brasão / Emblema estilizado estilo UNILINS */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003366] to-[#0055a5] flex items-center justify-center shadow-sm border border-[#002244]/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-lg tracking-tighter font-[var(--font-heading)]">
                U
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-[#003366] font-extrabold text-lg tracking-tight font-[var(--font-heading)]">
                UNILINS
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Jogo dos Números
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-6 text-sm font-semibold text-slate-700">
            <a
              href="#jogar"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-[#003366] transition-colors"
            >
              <Play className="w-4 h-4 text-[#004b8d]" />
              <span>Jogar</span>
            </a>
            <a
              href="#ranking"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-[#003366] transition-colors"
            >
              <Trophy className="w-4 h-4 text-[#f59e0b]" />
              <span>Ranking</span>
            </a>
            <a
              href="#regras"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-[#003366] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#004b8d]" />
              <span>Regras</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
