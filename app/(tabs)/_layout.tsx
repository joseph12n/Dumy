import { useColorScheme } from "@/components/useColorScheme";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
  return <FontAwesome size={22} name={name} color={color} />;
}

function AddTabIcon({
  focused,
  accentColor,
  cornerRadius,
}: {
  focused: boolean;
  accentColor: string;
  cornerRadius: number;
}) {
  return (
    <View
      className="w-12 h-12 rounded-full items-center justify-center -mt-3"
      style={{
        backgroundColor: focused ? accentColor : `${accentColor}CC`,
        borderRadius: cornerRadius,
      }}
    >
      <FontAwesome name="plus" size={22} color="#fff" />
    </View>
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
          : "#907898",
        tabBarStyle: {
          backgroundColor: isDark
            ? design.palette.surfaceDark
            : design.palette.backgroundLight,
          borderTopColor: isDark
            ? design.palette.borderDark
            : design.palette.borderLight,
          borderTopWidth: 1,
          height: design.density === "compact" ? 56 : 62,
          paddingBottom: 8,
          paddingTop: design.density === "compact" ? 2 : 4,
        },
        tabBarLabelStyle: {
          fontSize: scaleFont(11, design.fontScale),
          fontWeight: "600",
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
              accentColor={accentColor}
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
