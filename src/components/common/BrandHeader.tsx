import { useSettingsStore } from "@/src/store/settingsStore";
import {
    applyShadow,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { FadeInView } from "../animated/FadeInView";
import { ScalePress } from "../animated/ScalePress";

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
    <FadeInView duration={300} slideFrom={8}>
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <View className="flex-row items-center gap-3 flex-1">
          <LinearGradient
            colors={design.gradients.hero.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 42,
              height: 42,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: getCornerRadius(design.radius, "pill"),
              ...applyShadow(design.shadows.button),
            }}
          >
            <Text
              className="text-white font-bold"
              style={{ fontSize: scaleFont(17, design.fontScale) }}
            >
              D
            </Text>
          </LinearGradient>

          <View className="flex-1">
            <Text
              className="text-candy-text font-bold"
              style={{ fontSize: scaleFont(21, design.fontScale) }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                className="text-candy-text-secondary"
                style={{ fontSize: scaleFont(12, design.fontScale) }}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            ) : null}

            {status ? (
              <View className="flex-row items-center gap-1 mt-1">
                <View
                  className={`w-2 h-2 rounded-full ${status.dotClassName}`}
                />
                <Text
                  className={`text-xs ${status.textClassName ?? "text-candy-text-secondary"}`}
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                  numberOfLines={1}
                >
                  {status.label}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {rightIcon && onRightPress ? (
          <ScalePress
            onPress={onRightPress}
            haptic
            className="w-10 h-10 items-center justify-center"
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
          </ScalePress>
        ) : null}
      </View>
    </FadeInView>
  );
}
