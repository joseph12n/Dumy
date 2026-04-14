import { useColorScheme } from "@/components/useColorScheme";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    applyShadow,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <View className="items-center">
      <FontAwesome size={22} name={name} color={color} />
      {focused && (
        <View
          className="w-1.5 h-1.5 rounded-full mt-1"
          style={{ backgroundColor: color }}
        />
      )}
    </View>
  );
}

function AddTabIcon({
  focused,
  gradientColors,
  cornerRadius,
}: {
  focused: boolean;
  gradientColors: [string, string];
  cornerRadius: number;
}) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="w-14 h-14 items-center justify-center -mt-4"
      style={{
        borderRadius: cornerRadius,
        opacity: focused ? 1 : 0.85,
        shadowColor: gradientColors[0],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <FontAwesome name="plus" size={24} color="#fff" />
    </LinearGradient>
  );
}

export default function TabLayout() {
  const systemScheme = useColorScheme();
  const settings = useSettingsStore((s) => s.settings);
  const selectedTheme = settings["theme"] || "system";
  const design = resolveRuntimeDesign(settings);
  const accentColor = design.accentColor;
  const isDark =
    (selectedTheme === "system" ? systemScheme : selectedTheme) === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: isDark
          ? design.palette.borderLight
          : design.palette.borderDark,
        tabBarStyle: {
          backgroundColor: isDark
            ? design.palette.surfaceDark
            : design.palette.backgroundLight,
          borderTopColor: isDark
            ? design.palette.borderDark
            : design.palette.borderLight,
          borderTopWidth: 1,
          height: design.density === "compact" ? 60 : 66,
          paddingBottom: 8,
          paddingTop: design.density === "compact" ? 4 : 6,
          ...applyShadow({
            color: "#000",
            offset: { width: 0, height: -2 },
            opacity: 0.05,
            radius: 8,
            elevation: 8,
          }),
        },
        tabBarLabelStyle: {
          fontSize: scaleFont(10, design.fontScale),
          fontWeight: "600",
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clock-o" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <AddTabIcon
              focused={focused}
              gradientColors={design.gradients.hero.colors}
              cornerRadius={getCornerRadius(design.radius, "pill")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat IA",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="comments" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="scan" options={{ href: null }} />
    </Tabs>
  );
}
