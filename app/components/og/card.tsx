// The 1200×630 share card behind every page's link preview. Satori (the
// renderer behind next/og) needs inline styles and explicit flex layouts.

export const ogSize = { width: 1200, height: 630 };

const GREEN = "#b8ff00";
const BLUE = "#4d9dff";

export function OgCard({
  eyebrow,
  left,
  right,
  footer,
}: {
  eyebrow: string;
  left: string;
  right?: string;
  footer: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        color: "#f4f7f4",
        background:
          "radial-gradient(circle at 10% 20%, rgba(184,255,0,0.18), transparent 45%), radial-gradient(circle at 90% 80%, rgba(77,157,255,0.18), transparent 45%), #050706",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 800, letterSpacing: 2 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: GREEN }} />
        RIVALRY<span style={{ color: GREEN }}>MATRIX</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 6, color: GREEN, marginBottom: 18 }}>
          {eyebrow}
        </div>
        {right ? (
          <div style={{ display: "flex", flexDirection: "column", fontSize: 80, fontWeight: 900, lineHeight: 1 }}>
            <span>{left}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 24, margin: "10px 0" }}>
              <span style={{ fontSize: 44, color: "#050706", background: GREEN, padding: "4px 18px", borderRadius: 10 }}>
                VS
              </span>
            </div>
            <span style={{ color: BLUE }}>{right}</span>
          </div>
        ) : (
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1 }}>{left}</div>
        )}
      </div>

      <div style={{ display: "flex", fontSize: 26, color: "#849087" }}>{footer}</div>
    </div>
  );
}
