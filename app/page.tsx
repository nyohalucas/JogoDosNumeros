"use client";

import { useState } from "react";
import { Target, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { UnilinsHeader } from "@/components/UnilinsHeader";
import { UnilinsFooter } from "@/components/UnilinsFooter";
import { NumberGame } from "@/components/NumberGame";
import { RankingBoard } from "@/components/RankingBoard";
import type { Difficulty } from "@/lib/db";

export default function HomePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medio");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <UnilinsHeader />

      {/* Hero Institucional estilo UNILINS */}
      <section className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#004b8d] text-white border-b-4 border-[#f59e0b]">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-12">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#fbbf24] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Desafio de Lógica & Estratégia
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-[var(--font-heading)]">
              Jogo dos Números
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Descubra o número secreto sorteado aleatoriamente no menor número
              de tentativas possível. Escolha sua dificuldade, receba dicas de
              maior ou menor e conquiste o topo do ranking oficial.
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal: Jogo + Ranking */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 space-y-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <NumberGame
              difficulty={difficulty}
              onChangeDifficulty={setDifficulty}
              onRecordSaved={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </div>
          <div className="lg:col-span-5">
            <RankingBoard
              activeDifficulty={difficulty}
              onSelectDifficulty={setDifficulty}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        {/* Seção de Regras */}
        <section id="regras" className="pt-2">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#003366] font-[var(--font-heading)]">
              Como Funciona
            </h2>
            <p className="text-sm text-slate-600">
              Regras simples para testar sua intuição e raciocínio lógico
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                1. Três Níveis de Desafio
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jogue no modo <strong>Fácil (1 a 10)</strong>,{" "}
                <strong>Médio (1 a 100)</strong> ou{" "}
                <strong>Difícil (1 a 1000)</strong>. Um número secreto é
                sorteado a cada partida.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                2. Dicas e Validação de Limite
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A cada palpite dentro do intervalo, o sistema informa se o número
                secreto é <strong>maior</strong> ou <strong>menor</strong>.
                Números fora do limite são recusados sem gastar tentativas.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                3. Ranking no Neon
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Informe seu nome antes de iniciar a partida. Ao acertar, seu
                recorde é salvo automaticamente no banco Neon — quem acertar com{" "}
                <strong>menos tentativas</strong> fica no topo!
              </p>
            </div>
          </div>
        </section>
      </main>

      <UnilinsFooter />
    </div>
  );
}
