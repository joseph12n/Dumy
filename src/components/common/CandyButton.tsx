import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getButtonPadding,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

interface CandyButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<string, { container: string; text: string }> = {
  primary: {
    container: "bg-candy-pink",
    text: "text-white font-semibold",
  },
  secondary: {
    container: "bg-candy-purple",
    text: "text-white font-semibold",
  },
  outline: {
    container: "bg-transparent border-2 border-candy-pink",
    text: "text-candy-pink font-semibold",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-candy-pink font-medium",
  },
};

const sizeStyles: Record<string, { container: string; text: string }> = {
  sm: { container: "px-4 py-2", text: "text-sm" },
  md: { container: "px-6 py-3", text: "text-base" },
  lg: { container: "px-8 py-4", text: "text-lg" },
};

export function CandyButton({
  title,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  className,
  style,
  ...props
}: CandyButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const settings = useSettingsStore((state) => state.settings);
  const design = resolveRuntimeDesign(settings);

  const paddings = getButtonPadding(size, design.density);
  const baseFontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  const buttonColorStyle =
    variant === "primary"
      ? { backgroundColor: design.palette.primary }
      : variant === "secondary"
        ? { backgroundColor: design.palette.secondary }
        : variant === "outline"
          ? { borderColor: design.palette.primary }
          : null;

  const textColorStyle =
    variant === "outline" || variant === "ghost"
      ? { color: design.palette.primary }
      : null;

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center gap-2 ${v.container} ${s.container} ${disabled || loading ? "opacity-50" : ""} ${className ?? ""}`}
      style={[
        {
          borderRadius: getCornerRadius(design.radius, "pill"),
          paddingHorizontal: paddings.px,
          paddingVertical: paddings.py,
        },
        buttonColorStyle,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost"
              ? design.palette.primary
              : "#fff"
          }
          size="small"
        />
      ) : icon ? (
        icon
      ) : null}
      <Text
        className={`${v.text} ${s.text}`}
        style={[
          {
            fontSize: scaleFont(baseFontSize, design.fontScale),
          },
          textColorStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
