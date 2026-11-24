import { GraduationCap } from "lucide-react";

export function UnilinsFooter() {
  return (
    <footer className="mt-auto bg-[#002244] text-slate-300 border-t-4 border-[#f59e0b]">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#003366] border border-white/15 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#fbbf24]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide">
              UNILINS – Centro Universitário de Lins
            </p>
            <p className="text-xs text-slate-400">
              Jogo dos Números • Recordes armazenados em tempo real no Neon PostgreSQL
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          © 2026 Jogo dos Números • Identidade inspirada em{" "}
          <a
            href="https://unilins.edu.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#fbbf24] hover:underline"
          >
            unilins.edu.br
          </a>
        </p>
      </div>
    </footer>
  );
}
