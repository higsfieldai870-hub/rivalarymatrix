import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Browser and home-screen icons drawn from public/logo.png at build time, so
// swapping that file is all it takes to change them.
const logo = readFile(join(process.cwd(), "public/logo.png")).then(
  (data) => `data:image/png;base64,${data.toString("base64")}`,
);

export async function logoIcon(size: number, background?: string) {
  const padding = background ? Math.round(size * 0.08) : 0;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: background ?? "transparent",
        }}
      >
        <img src={await logo} alt="" width={size - padding * 2} height={size - padding * 2} />
      </div>
    ),
    { width: size, height: size },
  );
}
