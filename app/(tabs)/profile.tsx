import { AnimatedNumber, FadeInView } from "@/src/components/animated";
import { CandyButton, CandyCard } from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import { useSetting, useUpdateSetting } from "@/src/hooks/useSettings";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useChatStore } from "@/src/store/chatStore";
import { useSavingsStore } from "@/src/store/savingsStore";
import { useTransactionStore } from "@/src/store/transactionStore";
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

function DataAction({
  icon,
  title,
  subtitle,
  onPress,
  color,
  design,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  design: RuntimeDesignType;
}) {
  return (
    <CandyCard variant="glass" animated={false} className="mb-3">
      <View className="flex-row items-center gap-3">
        <View
          className="w-10 h-10 items-center justify-center"
          style={{ borderRadius: 999, backgroundColor: toRgba(color, 0.15) }}
        >
          <FontAwesome name={icon} size={16} color={color} />
        </View>
        <View className="flex-1">
          <Text
            className="text-candy-text"
            style={{
              fontSize: scaleFont(13, design.fontScale),
              fontWeight: "700",
            }}
          >
            {title}
          </Text>
          <Text
            className="text-candy-text-secondary"
            style={{ fontSize: scaleFont(11, design.fontScale) }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <CandyButton
        title={title}
        onPress={onPress}
        variant="outline"
        size="sm"
        className="mt-3"
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
  const deleteAllTransactions = useTransactionStore((s) => s.deleteAllTransactions);
  const deleteAllChatHistory = useChatStore((s) => s.deleteAllHistory);
  const deleteAllGoals = useSavingsStore((s) => s.deleteAllGoals);

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

  const handleDeleteAllTransactions = () => {
    Alert.alert(
      "Eliminar transacciones",
      "¿Seguro que quieres eliminar TODAS las transacciones? Esta accion no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar todo",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllTransactions();
              Alert.alert("Listo", "Todas las transacciones han sido eliminadas");
            } catch {
              Alert.alert("Error", "No se pudieron eliminar las transacciones");
            }
          },
        },
      ],
    );
  };

  const handleDeleteAllChat = () => {
    Alert.alert(
      "Eliminar historial de chat",
      "¿Seguro que quieres eliminar todo el historial de conversaciones con el bot?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar chat",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllChatHistory();
              Alert.alert("Listo", "Historial de chat eliminado");
            } catch {
              Alert.alert("Error", "No se pudo eliminar el historial");
            }
          },
        },
      ],
    );
  };

  const handleDeleteAllSavings = () => {
    Alert.alert(
      "Eliminar metas de ahorro",
      "¿Seguro que quieres eliminar TODAS las metas y aportes? Esta accion no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar metas",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllGoals();
              Alert.alert("Listo", "Todas las metas han sido eliminadas");
            } catch {
              Alert.alert("Error", "No se pudieron eliminar las metas");
            }
          },
        },
      ],
    );
  };

  const handleFullReset = () => {
    Alert.alert(
      "RESETEAR LA APP",
      "¡ATENCION! Esto eliminara TODOS tus datos:\n• Transacciones\n• Historial de chat\n• Metas de ahorro\n\n¿Estas completamente seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Si, resetear",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirmacion final",
              "Esta es la ultima oportunidad. ¿Realmente quieres borrar TODO?",
              [
                { text: "No, cancelar", style: "cancel" },
                {
                  text: "BORRAR TODO",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await Promise.all([
                        deleteAllTransactions(),
                        deleteAllChatHistory(),
                        deleteAllGoals(),
                      ]);
                      Alert.alert(
                        "App reseteada",
                        "Todos los datos han sido eliminados correctamente",
                      );
                    } catch {
                      Alert.alert("Error", "Hubo un error al resetear la app");
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
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

        {/* Data Management Section */}
        <FadeInView delay={160} className="mx-5 mt-5">
          <SectionTitle
            title="Gestion de datos"
            subtitle="Elimina o resetea datos de la app para comenzar de nuevo"
            design={design}
          />

          <DataAction
            icon="exchange"
            title="Eliminar transacciones"
            subtitle={`Elimina las ${transactions.length} transacciones registradas`}
            onPress={handleDeleteAllTransactions}
            color="#F59E0B"
            design={design}
          />

          <DataAction
            icon="comments"
            title="Eliminar historial de chat"
            subtitle="Borra todas las conversaciones con el bot de IA"
            onPress={handleDeleteAllChat}
            color="#6366F1"
            design={design}
          />

          <DataAction
            icon="bookmark"
            title="Eliminar metas de ahorro"
            subtitle="Elimina todas las metas y aportes de ahorro"
            onPress={handleDeleteAllSavings}
            color="#059669"
            design={design}
          />

          <CandyCard variant="glass" animated={false} className="mb-3">
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 items-center justify-center"
                style={{ borderRadius: 999, backgroundColor: toRgba("#EF4444", 0.15) }}
              >
                <FontAwesome name="warning" size={16} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-candy-text"
                  style={{
                    fontSize: scaleFont(13, design.fontScale),
                    fontWeight: "700",
                  }}
                >
                  Resetear la app
                </Text>
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                >
                  Elimina TODOS los datos de golpe (NO se puede deshacer)
                </Text>
              </View>
            </View>
            <CandyButton
              title="Resetear toda la app"
              onPress={handleFullReset}
              variant="outline"
              size="sm"
              className="mt-3"
            />
          </CandyCard>
        </FadeInView>

        <FadeInView delay={200} className="mx-5 mt-3 mb-10">
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
