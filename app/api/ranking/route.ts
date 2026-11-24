import { NextRequest, NextResponse } from "next/server";
import { Difficulty, ensureRankingsTable, getSql } from "@/lib/db";

const VALID_DIFFICULTIES: Difficulty[] = ["facil", "medio", "dificil"];

const DIFFICULTY_LIMITS: Record<Difficulty, number> = {
  facil: 10,
  medio: 100,
  dificil: 1000,
};

export async function GET(request: NextRequest) {
  try {
    const sql = getSql();
    if (!sql) {
      return NextResponse.json({
        configured: false,
        rankings: [],
        message: "DATABASE_URL do Neon não configurada.",
      });
    }

    await ensureRankingsTable();

    const difficultyParam = request.nextUrl.searchParams.get("difficulty");

    if (difficultyParam && VALID_DIFFICULTIES.includes(difficultyParam as Difficulty)) {
      const rows = await sql`
        SELECT id, player_name, difficulty, attempts, secret_number, created_at
        FROM rankings
        WHERE difficulty = ${difficultyParam}
        ORDER BY attempts ASC, created_at ASC
        LIMIT 20
      `;
      return NextResponse.json({ configured: true, rankings: rows });
    }

    const rows = await sql`
      SELECT id, player_name, difficulty, attempts, secret_number, created_at
      FROM rankings
      ORDER BY attempts ASC, created_at ASC
      LIMIT 60
    `;

    return NextResponse.json({ configured: true, rankings: rows });
  } catch (error) {
    console.error("Erro ao buscar ranking no Neon:", error);
    return NextResponse.json(
      { error: "Erro ao consultar o ranking no banco de dados." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { error: "Banco de dados Neon não configurado (DATABASE_URL ausente)." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const playerName = typeof body.playerName === "string" ? body.playerName.trim() : "";
    const difficulty = body.difficulty as Difficulty;
    const attempts = Number(body.attempts);
    const secretNumber = Number(body.secretNumber);

    if (!playerName || playerName.length < 2 || playerName.length > 60) {
      return NextResponse.json(
        { error: "Informe um nome válido entre 2 e 60 caracteres." },
        { status: 400 }
      );
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: "Dificuldade inválida." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(attempts) || attempts < 1) {
      return NextResponse.json(
        { error: "Número de tentativas inválido." },
        { status: 400 }
      );
    }

    const maxLimit = DIFFICULTY_LIMITS[difficulty];
    if (!Number.isInteger(secretNumber) || secretNumber < 1 || secretNumber > maxLimit) {
      return NextResponse.json(
        { error: "Número secreto fora do intervalo da dificuldade." },
        { status: 400 }
      );
    }

    await ensureRankingsTable();

    const inserted = await sql`
      INSERT INTO rankings (player_name, difficulty, attempts, secret_number)
      VALUES (${playerName}, ${difficulty}, ${attempts}, ${secretNumber})
      RETURNING id, player_name, difficulty, attempts, secret_number, created_at
    `;

    return NextResponse.json({ entry: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar recorde no Neon:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar o recorde no banco de dados." },
      { status: 500 }
    );
  }
}
