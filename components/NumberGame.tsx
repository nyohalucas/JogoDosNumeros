"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  User,
  Play,
  UserCheck,
} from "lucide-react";
import type { Difficulty } from "@/lib/db";

interface GuessItem {
  value: number;
  hint: "maior" | "menor" | "acertou";
}

interface NumberGameProps {
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  onRecordSaved: () => void;
}

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; min: number; max: number; description: string; badge: string }
> = {
  facil: {
    label: "Fácil",
    min: 1,
    max: 10,
    description: "Ideal para aquecer os motores",
    badge: "1 a 10",
  },
  medio: {
    label: "Médio",
    min: 1,
    max: 100,
    description: "Desafio equilibrado de lógica",
    badge: "1 a 100",
  },
  dificil: {
    label: "Difícil",
    min: 1,
    max: 1000,
    description: "Para mestres da busca binária",
    badge: "1 a 1000",
  },
};

function generateSecret(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

export function NumberGame({
  difficulty,
  onChangeDifficulty,
  onRecordSaved,
}: NumberGameProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const [secretNumber, setSecretNumber] = useState<number>(0);
  const [inputValue, setInputValue] = useState("");
  const [guesses, setGuesses] = useState<GuessItem[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "idle" | "maior" | "menor" | "error" | "won";
    message: string;
  }>({
    type: "idle",
    message: `Escolha um número entre ${config.min} e ${config.max} para começar.`,
  });

  // Estado de salvamento automático no Neon ao vencer
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSecretNumber(generateSecret(DIFFICULTY_CONFIG[difficulty].max));
  }, [difficulty]);

  const resetGame = useCallback(
    (targetDifficulty: Difficulty = difficulty) => {
      const targetMax = DIFFICULTY_CONFIG[targetDifficulty].max;
      setSecretNumber(generateSecret(targetMax));
      setInputValue("");
      setGuesses([]);
      setSaved(false);
      setSaveError(null);
      setFeedback({
        type: "idle",
        message: `Novo número sorteado! Digite um número entre 1 e ${targetMax}.`,
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [difficulty]
  );

  const handleDifficultyChange = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    onChangeDifficulty(newDiff);
    resetGame(newDiff);
  };

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      setNameError("Informe um nome entre 2 e 60 caracteres para iniciar.");
      return;
    }
    setNameError(null);
    setPlayerName(trimmed);
    resetGame(difficulty);
  };

  const handleSwitchPlayer = () => {
    setPlayerName("");
    setNameInput("");
    setNameError(null);
    resetGame(difficulty);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveRecordAutomatically = async (
    name: string,
    attemptsCount: number,
    secret: number
  ) => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: name,
          difficulty,
          attempts: attemptsCount,
          secretNumber: secret,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar recorde.");
      }
      setSaved(true);
      onRecordSaved();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Erro ao conectar ao Neon."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGuessSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!playerName || feedback.type === "won" || secretNumber === 0) return;

    const trimmed = inputValue.trim();
    const parsed = Number(trimmed);

    if (!trimmed || !Number.isInteger(parsed)) {
      setFeedback({
        type: "error",
        message: `Por favor, digite um número inteiro válido entre ${config.min} e ${config.max}.`,
      });
      return;
    }

    // Validação rigorosa de limite
    if (parsed < config.min || parsed > config.max) {
      setFeedback({
        type: "error",
        message: `Número fora do limite! Insira um número dentro do intervalo de ${config.min} a ${config.max}.`,
      });
      return;
    }

    if (parsed === secretNumber) {
      const nextGuesses: GuessItem[] = [
        { value: parsed, hint: "acertou" },
        ...guesses,
      ];
      setGuesses(nextGuesses);
      setInputValue("");
      setFeedback({
        type: "won",
        message: `Parabéns, ${playerName}! Você acertou o número ${secretNumber} em ${nextGuesses.length} ${
          nextGuesses.length === 1 ? "tentativa" : "tentativas"
        }!`,
      });
      void saveRecordAutomatically(playerName, nextGuesses.length, secretNumber);
      return;
    }

    const hint = parsed < secretNumber ? "maior" : "menor";
    const nextGuesses: GuessItem[] = [{ value: parsed, hint }, ...guesses];
    setGuesses(nextGuesses);
    setInputValue("");
    setFeedback({
      type: hint,
      message:
        hint === "maior"
          ? `O número secreto é MAIOR que ${parsed}.`
          : `O número secreto é MENOR que ${parsed}.`,
    });
    inputRef.current?.focus();
  };

  return (
    <section
      id="jogar"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Seletor de Dificuldade */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#003366] font-[var(--font-heading)]">
              Escolha a Dificuldade
            </h2>
            <p className="text-xs text-slate-500">
              Cada nível possui seu próprio ranking independente no Neon
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003366] text-white text-xs font-semibold">
            Tentativas: {guesses.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["facil", "medio", "dificil"] as Difficulty[]).map((diff) => {
            const item = DIFFICULTY_CONFIG[diff];
            const active = difficulty === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => handleDifficultyChange(diff)}
                className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  active
                    ? "border-[#003366] bg-[#003366] text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#004b8d]/50 hover:bg-blue-50/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{item.label}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      active
                        ? "bg-[#fbbf24] text-[#002244]"
                        : "bg-slate-100 text-[#003366]"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    active ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Identificação do Jogador ANTES de Jogar ou Área do Jogo */}
      <div className="p-6 space-y-6">
        {!playerName ? (
          <form
            onSubmit={handleStartGame}
            className="rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003366] text-[#fbbf24] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#003366] font-[var(--font-heading)]">
                  Identifique-se para Começar
                </h3>
                <p className="text-xs text-slate-500">
                  Seu nome será registrado automaticamente no ranking do Neon ao
                  acertar o número.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="player-name-start"
                className="block text-sm font-semibold text-slate-700"
              >
                Nome ou apelido do jogador:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={nameInputRef}
                  id="player-name-start"
                  type="text"
                  maxLength={60}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Digite seu nome..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b8d] focus:border-[#004b8d] bg-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#003366] hover:bg-[#004b8d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Começar a Jogar</span>
                </button>
              </div>
              {nameError && (
                <p className="text-xs text-red-600 font-medium">{nameError}</p>
              )}
            </div>
          </form>
        ) : (
          <>
            {/* Barra do Jogador Ativo */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <UserCheck className="w-4 h-4 text-[#004b8d]" />
                <span>
                  Jogador:{" "}
                  <strong className="text-[#003366]">{playerName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleSwitchPlayer}
                className="text-[#004b8d] hover:underline font-semibold cursor-pointer"
              >
                Trocar jogador
              </button>
            </div>

            {/* Banner de Feedback */}
            <div
              className={`rounded-xl p-4 border flex items-start gap-3 transition-colors ${
                feedback.type === "won"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : feedback.type === "error"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : feedback.type === "maior"
                  ? "bg-blue-50 border-blue-200 text-[#003366]"
                  : feedback.type === "menor"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {feedback.type === "won" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                {feedback.type === "error" && (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                {feedback.type === "maior" && (
                  <ArrowUp className="w-5 h-5 text-[#004b8d]" />
                )}
                {feedback.type === "menor" && (
                  <ArrowDown className="w-5 h-5 text-amber-600" />
                )}
                {feedback.type === "idle" && (
                  <Sparkles className="w-5 h-5 text-[#004b8d]" />
                )}
              </div>
              <div className="text-sm font-medium">{feedback.message}</div>
            </div>

            {/* Formulário de Palpite ou Card de Vitória */}
            {feedback.type !== "won" ? (
              <form onSubmit={handleGuessSubmit} className="space-y-3">
                <label
                  htmlFor="guess-input"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Digite seu palpite ({config.min} a {config.max}):
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    ref={inputRef}
                    id="guess-input"
                    type="number"
                    inputMode="numeric"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ex: ${Math.ceil(config.max / 2)}`}
                    className="flex-1 px-4 py-3.5 rounded-xl border border-slate-300 text-lg font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#004b8d] focus:border-[#004b8d] bg-white"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-[#003366] hover:bg-[#004b8d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Palpite</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => resetGame()}
                    title="Reiniciar partida"
                    className="px-4 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="sm:hidden">Reiniciar</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-[#003366] to-[#004b8d] p-6 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#fbbf24] text-[#002244] flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-[var(--font-heading)]">
                      Vitória no modo {config.label}!
                    </h3>
                    <p className="text-xs text-blue-100">
                      Jogador: <strong>{playerName}</strong> • Número secreto:{" "}
                      <strong>{secretNumber}</strong> • Total:{" "}
                      <strong>
                        {guesses.length}{" "}
                        {guesses.length === 1 ? "tentativa" : "tentativas"}
                      </strong>
                    </p>
                  </div>
                </div>

                {saving && (
                  <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-blue-100">
                    Salvando seu recorde automaticamente no Neon...
                  </div>
                )}

                {saved && (
                  <div className="rounded-xl bg-emerald-500/20 border border-emerald-300/30 px-4 py-3 text-sm text-emerald-100 font-medium">
                    Recorde salvo automaticamente no Neon! Confira sua posição no
                    Ranking.
                  </div>
                )}

                {saveError && (
                  <div className="rounded-xl bg-red-500/20 border border-red-300/40 px-4 py-3 text-sm text-red-100 flex flex-wrap items-center justify-between gap-2">
                    <span>{saveError}</span>
                    <button
                      type="button"
                      onClick={() =>
                        saveRecordAutomatically(
                          playerName,
                          guesses.length,
                          secretNumber
                        )
                      }
                      className="px-3 py-1 rounded-lg bg-[#fbbf24] text-[#002244] font-bold text-xs cursor-pointer"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => resetGame()}
                    className="px-5 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#002244] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Jogar Novamente</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchPlayer}
                    className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Trocar Jogador</span>
                  </button>
                </div>
              </div>
            )}

            {/* Histórico de Tentativas */}
            {guesses.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Histórico de Palpites ({guesses.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {guesses.map((g, idx) => {
                    const attemptNumber = guesses.length - idx;
                    return (
                      <span
                        key={`${attemptNumber}-${g.value}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          g.hint === "acertou"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : g.hint === "maior"
                            ? "bg-blue-50 border-blue-200 text-[#003366]"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                      >
                        <span className="opacity-60">#{attemptNumber}</span>
                        <span>{g.value}</span>
                        {g.hint === "maior" && (
                          <ArrowUp className="w-3.5 h-3.5" />
                        )}
                        {g.hint === "menor" && (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )}
                        {g.hint === "acertou" && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
