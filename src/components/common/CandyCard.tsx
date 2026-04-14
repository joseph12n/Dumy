import { useSettingsStore } from "@/src/store/settingsStore";
import {
    applyShadow,
    getCardPadding,
    getCornerRadius,
    resolveRuntimeDesign,
} from "@/src/theme/designRuntime";
import React from "react";
import { View, ViewProps } from "react-native";
import { FadeInView } from "../animated/FadeInView";

interface CandyCardProps extends ViewProps {
  variant?: "default" | "glass" | "pink" | "purple" | "blue";
  animated?: boolean;
  animDelay?: number;
  children: React.ReactNode;
}

export function CandyCard({
  variant = "default",
  animated = true,
  animDelay = 0,
  children,
  className,
  style,
  ...props
}: CandyCardProps) {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  const variantStyles = getVariantStyles(variant, design);

  const card = (
    <View
      className={`${className ?? ""}`}
      style={[
        {
          minWidth: 0,
          overflow: "hidden",
          borderRadius: getCornerRadius(design.radius, "card"),
          padding: getCardPadding(design.density),
          ...variantStyles,
          ...applyShadow(design.shadows.card),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (!animated) return card;

  return (
    <FadeInView delay={animDelay} duration={350} slideFrom={14}>
      {card}
    </FadeInView>
  );
}

function getVariantStyles(
  variant: string,
  design: ReturnType<typeof resolveRuntimeDesign>,
) {
  switch (variant) {
    case "glass":
      return {
        backgroundColor: "rgba(255, 255, 255, 0.82)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.65)",
      };
    case "pink":
      return {
        backgroundColor: "#ffe3f3",
        borderWidth: 1,
        borderColor: "#f8bddf",
      };
    case "purple":
      return {
        backgroundColor: "#f3e8ff",
        borderWidth: 1,
        borderColor: "#dbc2f9",
      };
    case "blue":
      return {
        backgroundColor: "#d9f2ff",
        borderWidth: 1,
        borderColor: "#a9d6ed",
      };
    default:
      return {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: design.palette.borderLight,
      };
  }
}
