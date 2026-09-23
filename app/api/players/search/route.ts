import { NextResponse, type NextRequest } from "next/server";
import { describeApiError, isBsdError } from "@/lib/bsd/client";
import { searchPlayers } from "@/lib/bsd/players";

// Player search for the comparison pickers. Runs on the server so the API
// key never reaches the browser; results are cached for a week per query.
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q") ?? "";

  const query = raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

  if (!/^[a-z][a-z' -]{2,39}$/.test(query)) {
    return NextResponse.json(
      { error: "Type at least 3 letters of the player's name." },
      { status: 400 },
    );
  }

  try {
    const players = await searchPlayers(query);
    return NextResponse.json({ players });
  } catch (error) {
    const status = isBsdError(error) && error.kind === "missing-key" ? 503 : 502;
    return NextResponse.json({ error: describeApiError(error) }, { status });
  }
}
