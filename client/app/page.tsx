"use client";
import Fade from "react-reveal/Fade";
import { WandSparkles, Sparkles } from "lucide-react";
import NavBarLanding from "./NavBarLanding";
import { TypeAnimation } from "react-type-animation";
export default function Home() {
  return (
    <div>
      <Fade top delay={1800}>
        <NavBarLanding />
      </Fade>
      <main className="hero">
        <Fade bottom delay={200}>
          <div className="tag">
            <WandSparkles />
            conversational learning
          </div>
        </Fade>
        <Fade bottom delay={600}>
          <h1 className="title">
            Learn through conversations.
            <br />
          </h1>
        </Fade>
        <Fade bottom delay={1000}>
          <h1>
            Not
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                "Textbooks.",
                3000, // wait 1s before replacing "Mice" with "Hamsters"
                "Lectures.",
                3000,
                "Articles.",
                3000,
              ]}
              wrapper="span"
              speed={30}
              style={{
                paddingLeft: "18px",
                fontSize: "72px",
                display: "inline-block",
              }}
              repeat={Infinity}
            />
          </h1>
        </Fade>
        <Fade bottom delay={1400}>
          <button className="primary" style={{ marginTop: "32px" }}>
            <Sparkles />
            Make magic
          </button>
        </Fade>
      </main>
      <section>
        <img
          src="./mockupLanding_adapted.svg"
          style={{
            marginTop: "110vh",
            marginLeft: "10vw",
            position: "absolute",
            top: "0",
          }}
        />
      </section>
    </div>
  );
}
