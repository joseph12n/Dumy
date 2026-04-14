import { AnimatedNumber, FadeInView } from "@/src/components/animated";
import { CandyButton, CandyCard } from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import { useSetting, useUpdateSetting } from "@/src/hooks/useSettings";
import { useTransactions } from "@/src/hooks/useTransactions";
import {
    applyShadow,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
    toRgba,
    UiDensity,
    UiPreset,
    UiRadius,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RuntimeDesignType = ReturnType<typeof resolveRuntimeDesign>;

function SectionTitle({
  title,
  subtitle,
  design,
}: {
  title: string;
  subtitle: string;
  design: RuntimeDesignType;
}) {
  return (
    <View className="mb-3 px-1">
      <Text
        style={{
          fontSize: scaleFont(17, design.fontScale),
          color: design.palette.textLight,
          fontWeight: "700",
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        className="text-candy-text-secondary mt-1"
        style={{ fontSize: scaleFont(12, design.fontScale) }}
        numberOfLines={2}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function StatTile({
  label,
  value,
  design,
}: {
  label: string;
  value: number;
  design: RuntimeDesignType;
}) {
  return (
    <CandyCard variant="glass" animated={false} className="py-4">
      <Text
        className="text-candy-text-secondary"
        style={{ fontSize: scaleFont(11, design.fontScale) }}
      >
        {label}
      </Text>
      <AnimatedNumber
        value={value}
        style={{
          fontSize: scaleFont(26, design.fontScale),
          color: design.palette.textLight,
          marginTop: 6,
          fontWeight: "800",
        }}
      />
    </CandyCard>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const updateSetting = useUpdateSetting();

  const savedName =
    useSetting("profile_name", "Usuario Dumy") || "Usuario Dumy";
  const avatarUri = useSetting("profile_avatar_uri");
  const accentColor = useSetting("accent_color", "#e040a0") || "#e040a0";
  const designPreset = (useSetting("ui_preset", "candy") ||
    "candy") as UiPreset;
  const uiDensity = (useSetting("ui_density", "comfortable") ||
    "comfortable") as UiDensity;
  const uiRadius = (useSetting("ui_radius", "soft") || "soft") as UiRadius;
  const uiFontScale = Number(useSetting("ui_font_scale", "1") || "1");

  const design = resolveRuntimeDesign({
    ui_preset: designPreset,
    ui_density: uiDensity,
    ui_radius: uiRadius,
    ui_font_scale: String(uiFontScale),
    accent_color: accentColor,
  });

  const [displayName, setDisplayName] = useState(savedName);

  useEffect(() => {
    setDisplayName(savedName);
  }, [savedName]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos dias";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const saveName = async () => {
    const normalized = displayName.trim();
    await updateSetting("profile_name", normalized || "Usuario Dumy");
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await updateSetting("profile_avatar_uri", result.assets[0].uri);
    }
  };

  const clearPhoto = async () => {
    Alert.alert("Quitar foto", "Se eliminara la foto del perfil.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: async () => {
          await updateSetting("profile_avatar_uri", "");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <FadeInView delay={30} className="mx-5 mt-4">
          <LinearGradient
            colors={design.gradients.hero.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              padding: 20,
              ...applyShadow(design.shadows.hero),
            }}
          >
            <View className="flex-row items-center gap-4">
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-16 h-16 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-16 h-16 items-center justify-center"
                  style={{
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  <FontAwesome name="user" size={24} color="#fff" />
                </View>
              )}

              <View className="flex-1">
                <Text
                  className="text-white/80"
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                >
                  {greeting}
                </Text>
                <Text
                  style={{
                    fontSize: scaleFont(23, design.fontScale),
                    color: "#fff",
                    fontWeight: "800",
                  }}
                  numberOfLines={1}
                >
                  {savedName}
                </Text>
                <Text
                  className="text-white/80"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                  numberOfLines={1}
                >
                  Perfil personal y actividad de tu cuenta
                </Text>
              </View>
            </View>
          </LinearGradient>
        </FadeInView>

        <FadeInView delay={80} className="mx-5 mt-5">
          <View className={`gap-3 ${isWide ? "flex-row" : ""}`}>
            <View style={{ width: isWide ? "48.5%" : "100%" }}>
              <StatTile
                label="Transacciones"
                value={transactions.length}
                design={design}
              />
            </View>
            <View style={{ width: isWide ? "48.5%" : "100%" }}>
              <StatTile
                label="Categorias"
                value={categories.length}
                design={design}
              />
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={120} className="mx-5 mt-5">
          <SectionTitle
            title="Identidad"
            subtitle="Edita tu nombre y foto para personalizar la experiencia"
            design={design}
          />
          <CandyCard variant="glass" animated={false}>
            <Text
              className="text-candy-text mb-2"
              style={{
                fontSize: scaleFont(12, design.fontScale),
                fontWeight: "700",
              }}
            >
              Nombre visible
            </Text>
            <TextInput
              className="border px-4 py-3 bg-white"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "card"),
                color: design.palette.textLight,
                fontSize: scaleFont(14, design.fontScale),
              }}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Tu nombre"
              placeholderTextColor={design.palette.borderDark}
            />

            <View className={`mt-3 gap-2 ${isWide ? "flex-row" : ""}`}>
              <View className={isWide ? "flex-1" : ""}>
                <CandyButton
                  title="Guardar"
                  onPress={saveName}
                  variant="primary"
                />
              </View>
              <View className={isWide ? "flex-1" : ""}>
                <CandyButton
                  title="Cambiar foto"
                  onPress={handlePickPhoto}
                  variant="outline"
                />
              </View>
            </View>

            {!!avatarUri && (
              <CandyButton
                title="Quitar foto"
                onPress={clearPhoto}
                variant="ghost"
                className="mt-2"
              />
            )}
          </CandyCard>
        </FadeInView>

        <FadeInView delay={170} className="mx-5 mt-5 mb-10">
          <SectionTitle
            title="Configuracion de la app"
            subtitle="Los ajustes visuales y del sistema estan en una seccion dedicada"
            design={design}
          />
          <CandyCard variant="default" animated={false}>
            <View className="flex-row items-center gap-3">
              <View
                className="w-11 h-11 items-center justify-center"
                style={{
                  borderRadius: getCornerRadius(design.radius, "pill"),
                  backgroundColor: toRgba(design.palette.primary, 0.16),
                }}
              >
                <FontAwesome
                  name="sliders"
                  size={17}
                  color={design.palette.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-candy-text"
                  style={{
                    fontSize: scaleFont(14, design.fontScale),
                    fontWeight: "700",
                  }}
                >
                  Centro de configuracion
                </Text>
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Tema, presets, densidad, bordes y categorias en un solo lugar.
                </Text>
              </View>
            </View>

            <CandyButton
              title="Abrir configuracion"
              onPress={() => router.push("../modal")}
              className="mt-3"
            />
          </CandyCard>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}
