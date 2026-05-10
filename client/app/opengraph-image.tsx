import { ImageResponse } from "next/og";

export const alt = "AdaptEd — Lectures that talk back";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFonts() {
  // Satori needs TTF/OTF (no woff2). Fontsource via jsDelivr serves TTF.
  const [displayItalic, mono] = await Promise.all([
    fetch(
      "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-700-italic.ttf"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf"
    ).then((r) => r.arrayBuffer()),
  ]);
  return [
    {
      name: "Fraunces",
      data: displayItalic,
      style: "italic" as const,
      weight: 700 as const,
    },
    {
      name: "JetBrains Mono",
      data: mono,
      style: "normal" as const,
      weight: 400 as const,
    },
  ];
}

export default async function OpengraphImage() {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          backgroundColor: "#0a0a0c",
          backgroundImage:
            "radial-gradient(60% 80% at 28% 35%, rgba(199,0,231,0.35) 0%, rgba(99,3,255,0.14) 45%, rgba(10,10,12,0) 75%)",
          color: "#f5f4f0",
          fontFamily: "Fraunces",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(245,244,240,0.55)",
            fontFamily: "JetBrains Mono",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: "#c700e7",
              }}
            />
            AdaptEd · Conversational learning
          </span>
          <span>v.2026</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 144,
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
              fontStyle: "italic",
              color: "#f5f4f0",
            }}
          >
            Lectures that
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 144,
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
              fontStyle: "italic",
              backgroundImage:
                "linear-gradient(135deg,#c700e7 0%,#9f03fe 55%,#6303ff 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            talk back.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "rgba(245,244,240,0.55)",
            fontFamily: "JetBrains Mono",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ maxWidth: 720 }}>
            LA Hacks 2024 · Google Gemini 1st · Fetch.ai Agentified
          </span>
          <span style={{ color: "#f5f4f0" }}>adapted →</span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
