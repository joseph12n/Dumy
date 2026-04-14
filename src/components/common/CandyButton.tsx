import { useSettingsStore } from "@/src/store/settingsStore";
import {
  applyShadow,
  getButtonPadding,
  getCornerRadius,
  resolveRuntimeDesign,
  scaleFont,
} from "@/src/theme/designRuntime";
import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { ScalePress } from "../animated/ScalePress";

interface CandyButtonProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
  style?: any;
}

export function CandyButton({
  title,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  onPress,
  className,
  style,
}: CandyButtonProps) {
  const settings = useSettingsStore((state) => state.settings);
  const design = resolveRuntimeDesign(settings);

  const paddings = getButtonPadding(size, design.density);
  const baseFontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  const isFilled = variant === "primary" || variant === "secondary";
  const bgColor =
    variant === "primary"
      ? design.palette.primary
      : variant === "secondary"
        ? design.palette.secondary
        : variant === "outline"
          ? "transparent"
          : "transparent";

  const borderStyle =
    variant === "outline"
      ? { borderWidth: 2, borderColor: design.palette.primary }
      : {};

  const textColor = isFilled ? "#ffffff" : design.palette.primary;

  return (
    <ScalePress
      onPress={onPress}
      disabled={disabled || loading}
      haptic={!disabled && !loading}
      className={`flex-row items-center justify-center gap-2 ${disabled || loading ? "opacity-50" : ""} ${className ?? ""}`}
      style={{
        borderRadius: getCornerRadius(design.radius, "pill"),
        paddingHorizontal: paddings.px,
        paddingVertical: paddings.py,
        backgroundColor: bgColor,
        ...borderStyle,
        ...(isFilled ? applyShadow(design.shadows.button) : {}),
        ...(typeof style === "object" && style !== null ? style : {}),
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : icon ? (
        icon
      ) : null}
      <Text
        className="font-semibold"
        style={{
          fontSize: scaleFont(baseFontSize, design.fontScale),
          color: textColor,
        }}
      >
        {title}
      </Text>
    </ScalePress>
  );
}
