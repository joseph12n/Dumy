import { FadeInView, ScalePress, StaggeredList } from "@/src/components/animated";
import { CandyButton, CandyCard, EmptyState } from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import {
  useApplyUnifiedDesignPreset,
  useSetting,
  useTheme,
  useUpdateSetting,
} from "@/src/hooks/useSettings";
import { useBudgetStatus } from "@/src/hooks/useStats";
import { ThemeType } from "@/src/store/types";
import {
  QUICK_UNIFIED_DESIGN_PRESETS,
  UiDensity,
  UiPreset,
  UiRadius,
  applyShadow,
  getCornerRadius,
  resolveRuntimeDesign,
  scaleFont,
  toRgba,
} from "@/src/theme/designRuntime";
import { formatPercentage } from "@/src/utils/currency";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RuntimeDesignType = ReturnType<typeof resolveRuntimeDesign>;

interface OptionItem<T extends string> {
  value: T;
  label: string;
}

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
      >
        {title}
      </Text>
      <Text
        className="text-candy-text-secondary mt-1"
        style={{ fontSize: scaleFont(12, design.fontScale) }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function OptionSelector<T extends string>({
  title,
  selected,
  options,
  onSelect,
  design,
}: {
  title: string;
  selected: T;
  options: OptionItem<T>[];
  onSelect: (value: T) => void;
  design: RuntimeDesignType;
}) {
  return (
    <View className="mb-4 last:mb-0">
      <Text
        className="text-candy-text-secondary mb-2"
        style={{ fontSize: scaleFont(12, design.fontScale), fontWeight: "600" }}
      >
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <ScalePress
              key={option.value}
              onPress={() => onSelect(option.value)}
              className="px-3 py-2"
              style={{
                borderRadius: getCornerRadius(design.radius, "pill"),
                backgroundColor: active
                  ? design.palette.primary
                  : design.palette.surfaceLight,
                ...(active ? applyShadow(design.shadows.button) : {}),
              }}
            >
              <Text
                style={{
                  fontSize: scaleFont(12, design.fontScale),
                  fontWeight: "700",
                  color: active ? "#fff" : design.palette.textLight,
                }}
              >
                {option.label}
              </Text>
            </ScalePress>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsModal() {
  const { categories, addCategory, deleteCategory } = useCategories();
  const budgetStatuses = useBudgetStatus();

  const applyUnifiedPreset = useApplyUnifiedDesignPreset();
  const updateSetting = useUpdateSetting();
  const currentTheme = useTheme();

  const accentColor = useSetting("accent_color", "#e040a0") || "#e040a0";
  const designPreset = (useSetting("ui_preset", "candy") || "candy") as UiPreset;
  const uiDensity = (useSetting("ui_density", "comfortable") || "comfortable") as UiDensity;
  const uiRadius = (useSetting("ui_radius", "soft") || "soft") as UiRadius;
  const uiFontScale = String(useSetting("ui_font_scale", "1") || "1");

  const design = resolveRuntimeDesign({
    ui_preset: designPreset,
    ui_density: uiDensity,
    ui_radius: uiRadius,
    ui_font_scale: uiFontScale,
    accent_color: accentColor,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(design.palette.primary);

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Ingresa un nombre para la categoria");
      return;
    }

    try {
      await addCategory({
        name: newName.trim(),
        icon: "tag",
        color: newColor,
        budgetLimit: null,
      });
      setNewName("");
      setShowAddForm(false);
    } catch {
      Alert.alert("Error", "No se pudo crear la categoria");
    }
  };

  const handleDelete = (id: string, name: string, isDefault: number) => {
    if (isDefault === 1) {
      Alert.alert("Info", "Las categorias por defecto no se pueden eliminar");
      return;
    }

    Alert.alert("Eliminar", `Eliminar categoria \"${name}\"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteCategory(id),
      },
    ]);
  };

  const colorOptions = ["#e040a0", "#7c52aa", "#0096cc", "#e53e3e", "#22c55e", "#f59e0b"];

  const getBudgetForCategory = (categoryId: string) =>
    budgetStatuses.find((b) => b.categoryId === categoryId);

  const setTheme = async (value: ThemeType) => {
    await updateSetting("theme", value);
  };

  const setDensity = async (value: UiDensity) => {
    await updateSetting("ui_density", value);
  };

  const setRadius = async (value: UiRadius) => {
    await updateSetting("ui_radius", value);
  };

  const setFontScale = async (value: string) => {
    await updateSetting("ui_font_scale", value);
  };

  const setAccent = async (value: string) => {
    await updateSetting("accent_color", value);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.palette.backgroundLight }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <FadeInView delay={30} className="mx-5 mt-4">
          <LinearGradient
            colors={design.gradients.hero.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              padding: 18,
              ...applyShadow(design.shadows.hero),
            }}
          >
            <Text className="text-white/80" style={{ fontSize: scaleFont(11, design.fontScale) }}>
              Ajustes del sistema
            </Text>
            <Text style={{ fontSize: scaleFont(23, design.fontScale), color: "#fff", fontWeight: "800" }}>
              Configuracion de App
            </Text>
            <Text className="text-white/80" style={{ fontSize: scaleFont(12, design.fontScale) }}>
              Apariencia, estilo y categorias en un solo espacio.
            </Text>
          </LinearGradient>
        </FadeInView>

        <FadeInView delay={90} className="mx-5 mt-5">
          <SectionTitle title="Presets" subtitle="Aplica combinaciones listas de tema y estilo" design={design} />
          <CandyCard variant="glass" animated={false}>
            <View className="gap-2">
              {QUICK_UNIFIED_DESIGN_PRESETS.map((preset) => {
                const selected =
                  designPreset === preset.uiPreset &&
                  uiDensity === preset.density &&
                  uiRadius === preset.radius &&
                  uiFontScale === preset.fontScale &&
                  currentTheme === preset.theme &&
                  accentColor.toLowerCase() === preset.accentColor.toLowerCase();

                return (
                  <ScalePress
                    key={preset.id}
                    onPress={() => applyUnifiedPreset(preset)}
                    className="border px-3 py-3"
                    style={{
                      borderRadius: getCornerRadius(design.radius, "card"),
                      borderColor: selected ? design.palette.primary : design.palette.borderLight,
                      borderWidth: selected ? 2 : 1,
                      backgroundColor: toRgba(preset.accentColor, selected ? 0.2 : 0.09),
                      ...(selected ? applyShadow(design.shadows.button) : {}),
                    }}
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                        <View className="flex-1">
                          <Text className="text-candy-text" style={{ fontSize: scaleFont(14, design.fontScale), fontWeight: "700" }}>
                            {preset.title}
                          </Text>
                          <Text className="text-candy-text-secondary" style={{ fontSize: scaleFont(12, design.fontScale) }}>
                            {preset.subtitle}
                          </Text>
                        </View>
                      </View>
                      <FontAwesome name={selected ? "check-circle" : "circle-thin"} size={16} color={selected ? design.palette.primary : design.palette.borderDark} />
                    </View>
                  </ScalePress>
                );
              })}
            </View>
          </CandyCard>
        </FadeInView>

        <FadeInView delay={140} className="mx-5 mt-5">
          <SectionTitle title="Ajuste fino" subtitle="Control granular de tema, densidad, radios y tipografia" design={design} />
          <CandyCard variant="default" animated={false}>
            <OptionSelector title="Tema" selected={currentTheme} onSelect={setTheme} design={design} options={[{ value: "light", label: "Claro" }, { value: "dark", label: "Oscuro" }, { value: "system", label: "Sistema" }]} />
            <OptionSelector title="Densidad" selected={uiDensity} onSelect={setDensity} design={design} options={[{ value: "compact", label: "Compacto" }, { value: "comfortable", label: "Comodo" }]} />
            <OptionSelector title="Radio de esquinas" selected={uiRadius} onSelect={setRadius} design={design} options={[{ value: "sharp", label: "Corte" }, { value: "soft", label: "Suave" }, { value: "rounded", label: "Redondo" }]} />
            <OptionSelector title="Escala tipografica" selected={uiFontScale} onSelect={setFontScale} design={design} options={[{ value: "0.95", label: "0.95x" }, { value: "1", label: "1x" }, { value: "1.15", label: "1.15x" }]} />
            <View className="mb-1">
              <Text className="text-candy-text-secondary mb-2" style={{ fontSize: scaleFont(12, design.fontScale), fontWeight: "600" }}>
                Color de acento
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {colorOptions.map((c) => {
                  const active = accentColor.toLowerCase() === c.toLowerCase();
                  return (
                    <ScalePress
                      key={c}
                      onPress={() => setAccent(c)}
                      className="w-8 h-8"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "pill"),
                        backgroundColor: c,
                        borderWidth: active ? 2 : 0,
                        borderColor: design.palette.textLight,
                        ...(active ? applyShadow(design.shadows.button) : {}),
                      }}
                    />
                  );
                })}
              </View>
            </View>
          </CandyCard>
        </FadeInView>

        <FadeInView delay={190} className="mx-5 mt-5">
          <SectionTitle title="Categorias" subtitle="Gestiona categorias y su estructura de gasto" design={design} />
          <CandyButton title={showAddForm ? "Cancelar" : "Agregar categoria"} icon={<FontAwesome name="plus-circle" size={16} color="#fff" />} onPress={() => setShowAddForm(!showAddForm)} variant={showAddForm ? "secondary" : "primary"} />
        </FadeInView>

        {showAddForm && (
          <FadeInView className="mx-5 mt-3" slideFrom={12}>
            <CandyCard variant="glass" animated={false}>
              <TextInput className="bg-white border px-4 py-3 text-candy-text mb-3" style={{ borderColor: design.palette.borderLight, borderRadius: getCornerRadius(design.radius, "card"), fontSize: scaleFont(15, design.fontScale) }} placeholder="Nombre de la categoria" placeholderTextColor={design.palette.borderDark} value={newName} onChangeText={setNewName} />
              <Text className="text-candy-text font-semibold mb-2" style={{ fontSize: scaleFont(13, design.fontScale) }}>Color</Text>
              <View className="flex-row gap-3 mb-3 flex-wrap">
                {colorOptions.map((c) => (
                  <ScalePress key={c} onPress={() => setNewColor(c)} scaleValue={0.9} className="w-8 h-8" style={{ borderRadius: getCornerRadius(design.radius, "pill"), backgroundColor: c, borderWidth: newColor === c ? 2 : 0, borderColor: design.palette.textLight, ...(newColor === c ? applyShadow(design.shadows.button) : {}) }} />
                ))}
              </View>
              <CandyButton title="Crear" onPress={handleAddCategory} size="sm" />
            </CandyCard>
          </FadeInView>
        )}

        <FadeInView delay={220} className="mx-5 mt-4 mb-8">
          {categories.length === 0 ? (
            <EmptyState icon="tags" title="Sin categorias" subtitle="Agrega tu primera categoria" />
          ) : (
            <CandyCard variant="glass" animated={false}>
              <StaggeredList staggerDelay={40}>
                {categories.map((cat, idx) => {
                  const bs = getBudgetForCategory(cat.id);
                  return (
                    <View key={cat.id} className={`flex-row items-center gap-3 ${idx > 0 ? "mt-3 pt-3 border-t border-candy-outline-light" : ""}`}>
                      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: cat.color + "20" }}>
                        <FontAwesome name={(cat.icon as any) || "tag"} size={16} color={cat.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-candy-text font-semibold" style={{ fontSize: scaleFont(13, design.fontScale) }} numberOfLines={1}>{cat.name}</Text>
                        {bs ? (
                          <View className="flex-row items-center gap-1 mt-1">
                            <View className="flex-1 h-1.5 overflow-hidden" style={{ backgroundColor: design.palette.surfaceLight, borderRadius: getCornerRadius(design.radius, "pill") }}>
                              <View className="h-full" style={{ width: `${Math.min(bs.percentageUsed, 100)}%`, backgroundColor: bs.isOverBudget ? "#e53e3e" : cat.color, borderRadius: getCornerRadius(design.radius, "pill") }} />
                            </View>
                            <Text className="text-candy-text-secondary" style={{ fontSize: scaleFont(11, design.fontScale) }}>{formatPercentage(bs.percentageUsed, 0)}</Text>
                          </View>
                        ) : (
                          <Text className="text-candy-text-secondary" style={{ fontSize: scaleFont(11, design.fontScale) }}>{cat.isDefault === 1 ? "Por defecto" : "Personalizada"}</Text>
                        )}
                      </View>
                      <ScalePress onPress={() => handleDelete(cat.id, cat.name, cat.isDefault)} scaleValue={0.9} className="w-8 h-8 items-center justify-center">
                        <FontAwesome name="ellipsis-v" size={16} color={design.palette.borderDark} />
                      </ScalePress>
                    </View>
                  );
                })}
              </StaggeredList>
            </CandyCard>
          )}
        </FadeInView>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
