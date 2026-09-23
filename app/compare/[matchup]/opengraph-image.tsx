import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/app/components/og/card";
import { displayName } from "@/app/components/comparison/view-model";
import { hasApiKey } from "@/lib/bsd/client";
import { resolveMatchup } from "@/lib/bsd/matchup";

export const alt = "Player comparison on Rivalry Matrix";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ matchup: string }> }) {
  const { matchup } = await params;
  const result = hasApiKey() ? await resolveMatchup(matchup) : null;
  const ok = result?.status === "ok";

  return new ImageResponse(
    (
      <OgCard
        eyebrow="HEAD TO HEAD • LIVE DATA"
        left={ok ? displayName(result.left) : "Player"}
        right={ok ? displayName(result.right) : "Player"}
        footer="Goals, assists, xG, ratings, scouting and transfers compared."
      />
    ),
    size,
  );
}
