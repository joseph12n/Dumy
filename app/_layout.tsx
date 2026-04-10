import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { AppDatabaseProvider } from "@/src/store/AppDatabaseProvider";
import { useSettingsStore } from "@/src/store/settingsStore";
import { resolveRuntimeDesign } from "@/src/theme/designRuntime";

import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function buildCandyTheme(
  isDark: boolean,
  accentColor: string,
  palette: {
    backgroundLight: string;
    backgroundDark: string;
    textLight: string;
    textDark: string;
    borderLight: string;
    borderDark: string;
    surfaceLight: string;
    surfaceDark: string;
  },
) {
  return {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: accentColor,
      background: isDark ? palette.backgroundDark : palette.backgroundLight,
      card: isDark ? palette.surfaceDark : palette.surfaceLight,
      text: isDark ? palette.textDark : palette.textLight,
      border: isDark ? palette.borderDark : palette.borderLight,
      notification: accentColor,
    },
  };
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppDatabaseProvider>
      <RootLayoutNav />
    </AppDatabaseProvider>
  );
}

function RootLayoutNav() {
  const systemScheme = useColorScheme();
  const settings = useSettingsStore((s) => s.settings);
  const selectedTheme = settings["theme"] || "system";
  const design = resolveRuntimeDesign(settings);
  const resolvedScheme =
    selectedTheme === "system" ? systemScheme : selectedTheme;
  const isDark = resolvedScheme === "dark";
  const appTheme = buildCandyTheme(isDark, design.accentColor, design.palette);

  return (
    <ThemeProvider value={appTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Categorias",
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
