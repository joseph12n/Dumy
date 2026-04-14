import React from "react";
import { FadeInView } from "./FadeInView";

interface StaggeredListProps {
  staggerDelay?: number;
  baseDuration?: number;
  slideFrom?: number;
  children: React.ReactNode;
}

export function StaggeredList({
  staggerDelay = 50,
  baseDuration = 350,
  slideFrom = 16,
  children,
}: StaggeredListProps) {
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, index) => (
        <FadeInView
          key={index}
          delay={index * staggerDelay}
          duration={baseDuration}
          slideFrom={slideFrom}
        >
          {child}
        </FadeInView>
      ))}
    </>
  );
}
