import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/app/components/og/card";

export const alt = "Rivalry Matrix: football head-to-head comparisons";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="FOOTBALL HEAD-TO-HEAD"
        left="Settle the debate"
        footer="Goals, assists, xG, ratings and scouting reports, side by side."
      />
    ),
    size,
  );
}
