import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadFont() {
  const data = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-700-italic.ttf"
  ).then((r) => r.arrayBuffer());
  return [
    {
      name: "Fraunces",
      data,
      style: "italic" as const,
      weight: 700 as const,
    },
  ];
}

export default async function AppleIcon() {
  const fonts = await loadFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0c",
          backgroundImage:
            "radial-gradient(circle at 30% 25%, rgba(199,0,231,0.45) 0%, rgba(10,10,12,0) 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 132,
            letterSpacing: "-6px",
            backgroundImage:
              "linear-gradient(135deg,#c700e7 0%,#9f03fe 55%,#6303ff 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Ed
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
