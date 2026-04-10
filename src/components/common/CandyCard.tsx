import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCardPadding,
    getCornerRadius,
    resolveRuntimeDesign,
} from "@/src/theme/designRuntime";
import React from "react";
import { View, ViewProps } from "react-native";

interface CandyCardProps extends ViewProps {
  variant?: "default" | "glass" | "pink" | "purple" | "blue";
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  default: "bg-candy-white border border-candy-outline-light",
  glass: "bg-candy-white/70",
  pink: "bg-candy-pink-pale",
  purple: "bg-candy-purple-pale",
  blue: "bg-candy-blue-pale",
};

export function CandyCard({
  variant = "default",
  children,
  className,
  style,
  ...props
}: CandyCardProps) {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  return (
    <View
      className={`${variantClasses[variant]} ${className ?? ""}`}
      style={[
        {
          borderRadius: getCornerRadius(design.radius, "card"),
          padding: getCardPadding(design.density),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
