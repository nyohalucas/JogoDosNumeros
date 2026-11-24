"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Medal, RefreshCw, Database, AlertCircle } from "lucide-react";
import type { Difficulty, RankingEntry } from "@/lib/db";

interface RankingBoardProps {
  activeDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  refreshTrigger: number;
}

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; range: string }> = {
  facil: { label: "Fácil", range: "1 a 10" },
  medio: { label: "Médio", range: "1 a 100" },
  dificil: { label: "Difícil", range: "1 a 1000" },
};

export function RankingBoard({
  activeDifficulty,
  onSelectDifficulty,
  refreshTrigger,
}: RankingBoardProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ranking?difficulty=${activeDifficulty}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar ranking");
      }
      setConfigured(data.configured !== false);
      setRankings(data.rankings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar ranking");
    } finally {
      setLoading(false);
    }
  }, [activeDifficulty]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings, refreshTrigger]);

  return (
    <section
      id="ranking"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Cabeçalho do Ranking */}
      <div className="bg-gradient-to-r from-[#003366] to-[#004b8d] px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-[#fbbf24]" />
          <div>
            <h2 className="font-bold text-lg leading-tight font-[var(--font-heading)]">
              Ranking de Recordes
            </h2>
            <p className="text-xs text-blue-100">
              Menos tentativas fica no topo • Salvo no Neon
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchRankings}
          disabled={loading}
          title="Atualizar ranking"
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Abas por Dificuldade */}
      <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50">
        {(["facil", "medio", "dificil"] as Difficulty[]).map((diff) => {
          const isActive = activeDifficulty === diff;
          return (
            <button
              key={diff}
              type="button"
              onClick={() => onSelectDifficulty(diff)}
              className={`py-3 px-2 text-center transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? "border-[#003366] bg-white text-[#003366] font-bold"
                  : "border-transparent text-slate-600 hover:text-[#003366] hover:bg-white/60 font-medium"
              }`}
            >
              <div className="text-sm">{DIFFICULTY_LABELS[diff].label}</div>
              <div className="text-[11px] text-slate-400 font-normal">
                {DIFFICULTY_LABELS[diff].range}
              </div>
            </button>
          );
        })}
      </div>

      {/* Conteúdo do Ranking */}
      <div className="p-5 flex-1">
        {!configured ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Banco Neon ainda não conectado</p>
              <p className="text-xs text-amber-800 mt-1">
                Configure a variável <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> no
                ambiente para salvar e exibir os recordes no Neon.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="space-y-2.5 py-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-12 rounded-xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium text-sm">
              Nenhum recorde registrado no modo{" "}
              <span className="font-bold text-[#003366]">
                {DIFFICULTY_LABELS[activeDifficulty].label}
              </span>
              .
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Seja o primeiro a acertar e entrar no topo do ranking!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const medalColor =
                rank === 1
                  ? "bg-amber-100 text-amber-700 border-amber-300"
                  : rank === 2
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : rank === 3
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : "bg-slate-50 text-slate-500 border-slate-200";

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                    rank === 1
                      ? "bg-amber-50/40 border-amber-200"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-extrabold shrink-0 ${medalColor}`}
                    >
                      {isTop3 ? <Medal className="w-4 h-4" /> : `${rank}º`}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {entry.player_name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Nº secreto: {entry.secret_number} •{" "}
                        {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#003366]/10 text-[#003366] font-bold text-xs">
                      {entry.attempts}{" "}
                      {entry.attempts === 1 ? "tentativa" : "tentativas"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
