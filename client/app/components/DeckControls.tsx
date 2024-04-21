import { useContext, useEffect } from "react";
import { DeckContext, DefaultTemplate } from "spectacle";

export default function DeckControls(props: {
  onSlideChange: (slideIndex: number) => void;
}) {
  const {
    activeView: { slideIndex },
  } = useContext(DeckContext);

  //   const setSlideNumber = useSlideStore((state) => state.setSlideNumber);

  useEffect(() => {
    props.onSlideChange(slideIndex);
    // setSlideNumber(slideIndex);
  }, [slideIndex]);

  return (
    <DefaultTemplate
      color="purple"
      // Add any custom props or styles here
      // For example:
      // backgroundColor="blue"
      // fontFamily="Arial"
    />
  );
}
