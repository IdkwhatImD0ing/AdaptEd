import React from "react";
import { BarChartBig, WandSparkles, CircleUserRound } from "lucide-react";
import NavBarElement from "./navBarElement"; // Assuming NavBarElement is a component

function NavBar() {
  return (
    <div className="nav-contain">
      <img src="./AdaptED_logo.png" width={"140px"} />
      <NavBarElement
        additionalClass="active"
        icon={<BarChartBig />}
        navBarSection="Home"
      />
      <NavBarElement icon={<WandSparkles />} navBarSection="Create" />
      <NavBarElement icon={<CircleUserRound />} navBarSection="Profile" />
    </div>
  );
}

export default NavBar;
