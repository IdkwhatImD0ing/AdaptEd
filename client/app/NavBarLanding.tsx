import { WandSparkles, CircleUserRound, Home } from "lucide-react";
import ReactiveButton from "reactive-button";

function NavBarLanding() {
  return (
    <div className="grid-row nav-landing-contain">
      <img src="./AdaptED_logo.png" style={{ width: "180px" }} />
      <nav>
        <ul>
          <li className="flex-row" style={{ gap: "12px" }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "white",
                padding: "8px 16px",
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
                backgroundColor: "#C700E7",
              }}
            >
              <Home />
              Home
            </a>
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#303036",
                borderRadius: "100px",
                padding: "8px 16px",
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <WandSparkles />
              Create
            </a>
            <a
              href="/profile"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "#303036",
                borderRadius: "100px",
                padding: "8px 16px",
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <CircleUserRound />
              About us
            </a>
          </li>
        </ul>
      </nav>
      <div className="flex-row" style={{ gap: "22px" }}>
        {/* Log in */}
        <a href="/api/auth/login">
          <div style={{ fontSize: "22px" }}>Log in</div>
        </a>
        {/* Sign up */}

        <button
          className="primary"
          style={{ borderRadius: "100px", fontSize: "22px" }}
          onClick={() => {
            window.location.href = "/api/auth/signup";
          }}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}

export default NavBarLanding;
