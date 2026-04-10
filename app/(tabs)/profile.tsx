import { CandyButton, CandyCard } from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import {
    useApplyUnifiedDesignPreset,
    useSetting,
    useTheme,
    useUpdateSetting,
} from "@/src/hooks/useSettings";
import { useTransactions } from "@/src/hooks/useTransactions";
import {
    QUICK_UNIFIED_DESIGN_PRESETS,
    UiDensity,
    UiPreset,
    UiRadius,
    resolveRuntimeDesign,
    toRgba,
} from "@/src/theme/designRuntime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MenuItemProps {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
  subtitle: string;
  iconColor?: string;
  onPress?: () => void;
}

function MenuItem({
  icon,
  label,
  subtitle,
  iconColor = "#e040a0",
  onPress,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-4 py-3"
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: iconColor + "20" }}
      >
        <FontAwesome name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-candy-text text-sm font-semibold">{label}</Text>
        <Text className="text-candy-text-secondary text-xs">{subtitle}</Text>
      </View>
      <FontAwesome name="chevron-right" size={12} color="#907898" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const currentTheme = useTheme();
  const applyUnifiedPreset = useApplyUnifiedDesignPreset();
  const updateSetting = useUpdateSetting();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
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
  const runtimeDesign = resolveRuntimeDesign({
    ui_preset: designPreset,
    ui_density: uiDensity,
    ui_radius: uiRadius,
    ui_font_scale: String(uiFontScale),
    accent_color: accentColor,
  });
  const [displayName, setDisplayName] = React.useState(savedName);

  React.useEffect(() => {
    setDisplayName(savedName);
  }, [savedName]);

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

  const applyUnified = async (presetId: string) => {
    const preset = QUICK_UNIFIED_DESIGN_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    await applyUnifiedPreset(preset);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: runtimeDesign.palette.backgroundLight }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <View className="flex-row items-center gap-2">
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: runtimeDesign.palette.primary }}
            >
              <Text className="text-white text-base font-bold">D</Text>
            </View>
            <Text className="text-candy-text text-xl font-bold">Perfil</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View className="mx-5 mt-4">
          <CandyCard variant="glass" className="items-center py-6">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="w-20 h-20 rounded-full mb-3"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: accentColor }}
              >
                <FontAwesome name="user" size={36} color="#fff" />
              </View>
            )}
            <Text className="text-candy-text text-lg font-bold">
              {savedName}
            </Text>
            <Text className="text-candy-text-secondary text-sm">
              Usuario de Dumy
            </Text>

            <View className="w-full mt-4 px-2 gap-2">
              <Text className="text-candy-text text-xs font-semibold">
                Nombre visible
              </Text>
              <TextInput
                className="bg-candy-white border border-candy-outline-light rounded-candy px-3 py-2 text-candy-text"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Escribe tu nombre"
                placeholderTextColor="#907898"
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <CandyButton
                    title="Guardar nombre"
                    onPress={saveName}
                    variant="secondary"
                  />
                </View>
                <View className="flex-1">
                  <CandyButton
                    title="Cambiar foto"
                    onPress={handlePickPhoto}
                    variant="primary"
                  />
                </View>
              </View>
              {!!avatarUri && (
                <CandyButton
                  title="Quitar foto"
                  onPress={clearPhoto}
                  variant="ghost"
                />
              )}
            </View>

            {/* Stats */}
            <View className="flex-row gap-6 mt-4">
              <View className="items-center">
                <Text className="text-candy-text text-lg font-bold">
                  {transactions.length}
                </Text>
                <Text className="text-candy-text-secondary text-xs">
                  Transacciones
                </Text>
              </View>
              <View className="w-px bg-candy-outline-light" />
              <View className="items-center">
                <Text className="text-candy-text text-lg font-bold">
                  {categories.length}
                </Text>
                <Text className="text-candy-text-secondary text-xs">
                  Categorias
                </Text>
              </View>
            </View>
          </CandyCard>
        </View>

        {/* Cambio rapido unificado */}
        <View className="mx-5 mt-5">
          <Text className="text-candy-text text-base font-bold mb-3">
            Cambio rapido (1 clic)
          </Text>
          <CandyCard variant="glass">
            <View className="gap-2">
              {QUICK_UNIFIED_DESIGN_PRESETS.map((preset) => {
                const selected =
                  designPreset === preset.uiPreset &&
                  uiDensity === preset.density &&
                  uiRadius === preset.radius &&
                  String(uiFontScale) === preset.fontScale &&
                  currentTheme === preset.theme &&
                  accentColor.toLowerCase() ===
                    preset.accentColor.toLowerCase();

                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => applyUnified(preset.id)}
                    className="px-3 py-3 border"
                    style={{
                      borderRadius: 14,
                      borderColor: selected
                        ? runtimeDesign.palette.primary
                        : runtimeDesign.palette.borderLight,
                      borderWidth: selected ? 2 : 1,
                      backgroundColor: toRgba(preset.accentColor, 0.08),
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-7 h-7 rounded-full"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                      <View className="flex-1">
                        <Text className="text-candy-text text-sm font-semibold">
                          {preset.title}
                        </Text>
                        <Text className="text-candy-text-secondary text-xs">
                          {preset.subtitle}
                        </Text>
                      </View>
                      {selected && (
                        <FontAwesome
                          name="check"
                          size={14}
                          color={runtimeDesign.palette.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CandyCard>
        </View>

        {/* Menu Items */}
        <View className="mx-5 mt-5">
          <Text className="text-candy-text text-base font-bold mb-3">
            Configuracion
          </Text>
          <CandyCard variant="glass">
            <MenuItem
              icon="tags"
              label="Categorias"
              subtitle="Gestiona tus categorias"
              iconColor="#7c52aa"
            />
            <View className="border-t border-candy-outline-light" />
            <MenuItem
              icon="bell"
              label="Notificaciones"
              subtitle="Alertas y recordatorios"
              iconColor="#0096cc"
            />
            <View className="border-t border-candy-outline-light" />
            <MenuItem
              icon="shield"
              label="Privacidad"
              subtitle="Tus datos son locales"
              iconColor="#e040a0"
            />
            <View className="border-t border-candy-outline-light" />
            <MenuItem
              icon="database"
              label="Datos"
              subtitle="Exportar o importar datos"
              iconColor="#7c52aa"
            />
          </CandyCard>
        </View>

        {/* About */}
        <View className="mx-5 mt-5 mb-8">
          <CandyCard variant="purple">
            <View className="items-center py-2">
              <Text className="text-candy-text text-sm font-bold mb-1">
                Dumy v1.0.0
              </Text>
              <Text className="text-candy-text-secondary text-xs text-center">
                Tu asistente financiero local y privado.{"\n"}Hecho con amor en
                Colombia.
              </Text>
            </View>
          </CandyCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
