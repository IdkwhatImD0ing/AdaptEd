import { useContext, useEffect } from "react";
import { DeckContext, DefaultTemplate } from "spectacle";

export default function DeckControls() {
  const {
    activeView: { slideIndex },
  } = useContext(DeckContext);

  //   const setSlideNumber = useSlideStore((state) => state.setSlideNumber);

  useEffect(() => {
    console.log(`Current slide number: ${slideIndex}`);
    // setSlideNumber(slideIndex);
  }, [slideIndex]);

  return (
    <DefaultTemplate
    // Add any custom props or styles here
    // For example:
    // backgroundColor="blue"
    // fontFamily="Arial"
    />
  );
}
