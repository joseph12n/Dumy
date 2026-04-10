import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderStatus {
  label: string;
  dotClassName: string;
  textClassName?: string;
}

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  status?: HeaderStatus;
  rightIcon?: React.ComponentProps<typeof FontAwesome>["name"];
  onRightPress?: () => void;
}

export function BrandHeader({
  title,
  subtitle,
  status,
  rightIcon,
  onRightPress,
}: BrandHeaderProps) {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="w-10 h-10 items-center justify-center border-2 border-candy-white"
          style={{
            borderRadius: getCornerRadius(design.radius, "pill"),
            backgroundColor: design.palette.primary,
          }}
        >
          <Text
            className="text-candy-white font-bold"
            style={{ fontSize: scaleFont(16, design.fontScale) }}
          >
            D
          </Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-candy-text font-bold"
            style={{ fontSize: scaleFont(20, design.fontScale) }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="text-candy-text-secondary"
              style={{ fontSize: scaleFont(12, design.fontScale) }}
            >
              {subtitle}
            </Text>
          ) : null}

          {status ? (
            <View className="flex-row items-center gap-1 mt-1">
              <View className={`w-2 h-2 rounded-full ${status.dotClassName}`} />
              <Text
                className={`text-xs ${status.textClassName ?? "text-candy-text-secondary"}`}
                style={{ fontSize: scaleFont(11, design.fontScale) }}
              >
                {status.label}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {rightIcon && onRightPress ? (
        <TouchableOpacity
          onPress={onRightPress}
          className="w-9 h-9 items-center justify-center"
          style={{
            borderRadius: getCornerRadius(design.radius, "pill"),
            backgroundColor: design.palette.surfaceLight,
          }}
        >
          <FontAwesome
            name={rightIcon}
            size={18}
            color={design.palette.primary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
