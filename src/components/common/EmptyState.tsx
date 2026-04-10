import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  return (
    <View className="items-center justify-center py-12 px-6">
      <View
        className="w-16 h-16 items-center justify-center mb-4"
        style={{
          borderRadius: getCornerRadius(design.radius, "pill"),
          backgroundColor: design.palette.surfaceLight,
        }}
      >
        <FontAwesome name={icon} size={28} color={design.palette.primary} />
      </View>
      <Text
        className="text-candy-text font-semibold text-center mb-1"
        style={{ fontSize: scaleFont(18, design.fontScale) }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-candy-text-secondary text-center"
          style={{ fontSize: scaleFont(14, design.fontScale) }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
