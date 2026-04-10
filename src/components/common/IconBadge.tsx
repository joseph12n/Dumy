import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { View } from "react-native";

interface IconBadgeProps {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  color?: string;
  bgColor?: string;
  size?: number;
  className?: string;
}

export function IconBadge({
  icon,
  color,
  bgColor,
  size = 20,
  className,
}: IconBadgeProps) {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  const resolvedColor = color ?? design.palette.primary;
  const resolvedBg = bgColor ?? design.palette.surfaceLight;

  return (
    <View
      className={`w-10 h-10 items-center justify-center ${className ?? ""}`}
      style={{
        backgroundColor: resolvedBg,
        borderRadius: getCornerRadius(design.radius, "pill"),
      }}
    >
      <FontAwesome name={icon} size={size} color={resolvedColor} />
    </View>
  );
}
