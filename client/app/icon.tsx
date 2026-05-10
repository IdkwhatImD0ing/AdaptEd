import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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

export default async function Icon() {
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
            "radial-gradient(circle at 30% 25%, rgba(199,0,231,0.6) 0%, rgba(10,10,12,0) 65%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: "-3px",
            backgroundImage:
              "linear-gradient(135deg,#c700e7 0%,#9f03fe 55%,#6303ff 100%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
            paddingBottom: 6,
          }}
        >
          Ed
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
