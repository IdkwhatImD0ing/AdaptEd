"use client";

import React, { useContext, useEffect } from "react";
import {
  Deck,
  Heading,
  SlideLayout,
  Text,
  Image,
  DeckContext,
} from "spectacle";
import DeckControls from "./DeckControls";

let channel: BroadcastChannel;

export function skipToSlide(slideIndex: number, stepIndex: number = 0) {
  if (!channel) {
    channel = new BroadcastChannel("spectacle_presenter_bus");
  }
  channel.postMessage(
    JSON.stringify({
      type: "SYNC",
      payload: {
        slideIndex,
        stepIndex,
      },
    })
  );
}

export function shutdownSlideshow() {
  if (channel) {
    channel.close();
  }
}

const theme = {
  colors: {
    primary: "black",
    secondary: "purple",
    tertiary: "white",
  },
  backdropStyle: {
    backgroundColor: "white",
  },
};

export default function Slideshow(props: { lecture: Lecture }) {
  return (
    <Deck theme={theme} template={<DeckControls />}>
      {props.lecture.slides.map((slide, index) => (
        <React.Fragment key={index}>
          {slide.template_id === 1 && (
            <SlideLayout.TwoColumn
              key={index}
              left={
                <>
                  <Heading>{slide.title}</Heading>
                  {slide.texts?.map((text, index) => (
                    <Text key={index}>{text}</Text>
                  ))}
                </>
              }
              right={
                slide.images.length > 0 &&
                slide.images.map((image, index) => (
                  <Image key={index} src={image.src} alt={image.description} />
                ))
              }
            />
          )}
          {slide.template_id === 2 && (
            <SlideLayout.TwoColumn
              key={index}
              left={
                slide.images.length > 0 &&
                slide.images.map((image, index) => (
                  <Image key={index} src={image.src} alt={image.description} />
                ))
              }
              right={
                <>
                  <Heading>{slide.title}</Heading>
                  {slide.texts?.map((text, index) => (
                    <Text key={index}>{text}</Text>
                  ))}
                </>
              }
            />
          )}
          {slide.template_id === 3 && (
            <SlideLayout.Center key={index}>
              <Heading>{slide.title}</Heading>
              {slide.texts?.map((text, index) => (
                <Text key={index}>{text}</Text>
              ))}
              {slide.images.length > 0 &&
                slide.images.map((image, index) => (
                  <Image key={index} src={image.src} alt={image.description} />
                ))}
            </SlideLayout.Center>
          )}
          {slide.template_id === 4 && (
            <SlideLayout.List
              key={index}
              title={slide.title}
              items={slide.texts || []}
            />
          )}
          {slide.template_id === 5 && (
            <SlideLayout.Section key={index}>
              <Heading>{slide.title}</Heading>
              {slide.texts?.map((text, index) => (
                <Text key={index}>{text}</Text>
              ))}
            </SlideLayout.Section>
          )}
          {slide.template_id === 6 && (
            <SlideLayout.Statement key={index}>
              <Heading>{slide.title}</Heading>
              {slide.texts?.map((text, index) => (
                <Text key={index}>{text}</Text>
              ))}
            </SlideLayout.Statement>
          )}
          {slide.template_id === 7 && (
            <SlideLayout.BigFact key={index}>
              <Heading>{slide.title}</Heading>
              {slide.texts?.map((text, index) => (
                <Text key={index}>{text}</Text>
              ))}
            </SlideLayout.BigFact>
          )}
          {slide.template_id === 8 && (
            <SlideLayout.Quote key={index} attribution={slide.texts?.[1]}>
              <Heading>{slide.title}</Heading>
              {slide.texts?.map((text, index) => (
                <Text key={index}>{text}</Text>
              ))}
            </SlideLayout.Quote>
          )}
          {slide.template_id === 9 && (
            <SlideLayout.HorizontalImage
              key={index}
              src={slide.images[0].src}
              alt={slide.images[0].description}
              title={slide.title}
            />
          )}
          {slide.template_id === 10 && (
            <SlideLayout.VerticalImage
              key={index}
              src={slide.images[0].src}
              alt={slide.images[0].description}
              listItems={slide.texts || []}
              title={slide.title}
              titleProps={{ color: "red" }}
            />
          )}
          {slide.template_id === 11 && (
            <SlideLayout.ThreeUpImage
              key={index}
              primary={{
                src: slide.images[0].src,
                alt: slide.images[0].description,
              }}
              top={{
                src: slide.images[1].src,
                alt: slide.images[1].description,
              }}
              bottom={{
                src: slide.images[2].src,
                alt: slide.images[2].description,
              }}
            />
          )}
          {slide.template_id === 12 && (
            <SlideLayout.FullBleedImage
              key={index}
              src={slide.images[0].src}
              alt={slide.images[0].description}
            />
          )}
        </React.Fragment>
      ))}
    </Deck>
  );
}
