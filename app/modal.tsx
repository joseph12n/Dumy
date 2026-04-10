import { CandyButton, CandyCard, EmptyState } from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import { useBudgetStatus } from "@/src/hooks/useStats";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import { formatPercentage } from "@/src/utils/currency";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesModal() {
  const { categories, addCategory, deleteCategory } = useCategories();
  const budgetStatuses = useBudgetStatus();
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#e040a0");

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
    Alert.alert("Eliminar", `Eliminar categoria "${name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteCategory(id),
      },
    ]);
  };

  const colorOptions = [
    "#e040a0",
    "#7c52aa",
    "#0096cc",
    "#e53e3e",
    "#22c55e",
    "#f59e0b",
  ];

  const getBudgetForCategory = (categoryId: string) =>
    budgetStatuses.find((b) => b.categoryId === categoryId);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text
            className="text-candy-text font-bold"
            style={{ fontSize: scaleFont(24, design.fontScale) }}
          >
            Categorias
          </Text>
          <Text
            className="text-candy-text-secondary mt-1"
            style={{ fontSize: scaleFont(13, design.fontScale) }}
          >
            Personaliza tus categorias de gastos
          </Text>
        </View>

        {/* Add button */}
        <View className="mx-5 mt-4">
          <CandyButton
            title="Agregar Categoria"
            icon={<FontAwesome name="plus-circle" size={16} color="#fff" />}
            onPress={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "secondary" : "primary"}
          />
        </View>

        {/* Add Form */}
        {showAddForm && (
          <View className="mx-5 mt-3">
            <CandyCard variant="glass">
              <TextInput
                className="bg-candy-white border px-4 py-3 text-candy-text mb-3"
                style={{
                  borderColor: design.palette.borderLight,
                  borderRadius: getCornerRadius(design.radius, "card"),
                  fontSize: scaleFont(15, design.fontScale),
                }}
                placeholder="Nombre de la categoria"
                placeholderTextColor="#907898"
                value={newName}
                onChangeText={setNewName}
              />
              <Text
                className="text-candy-text font-semibold mb-2"
                style={{ fontSize: scaleFont(13, design.fontScale) }}
              >
                Color
              </Text>
              <View className="flex-row gap-3 mb-3">
                {colorOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setNewColor(c)}
                    className="w-8 h-8"
                    style={{
                      borderRadius: getCornerRadius(design.radius, "pill"),
                      backgroundColor: c,
                      borderWidth: newColor === c ? 2 : 0,
                      borderColor: design.palette.textLight,
                    }}
                  />
                ))}
              </View>
              <CandyButton
                title="Crear"
                onPress={handleAddCategory}
                size="sm"
              />
            </CandyCard>
          </View>
        )}

        {/* Category List */}
        <View className="mx-5 mt-5 mb-8">
          {categories.length === 0 ? (
            <EmptyState
              icon="tags"
              title="Sin categorias"
              subtitle="Agrega tu primera categoria"
            />
          ) : (
            <CandyCard variant="glass">
              {categories.map((cat, idx) => {
                const bs = getBudgetForCategory(cat.id);
                return (
                  <View
                    key={cat.id}
                    className={`flex-row items-center gap-3 ${idx > 0 ? "mt-3 pt-3 border-t border-candy-outline-light" : ""}`}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      <FontAwesome
                        name={(cat.icon as any) || "tag"}
                        size={16}
                        color={cat.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-candy-text font-semibold"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                      >
                        {cat.name}
                      </Text>
                      {bs ? (
                        <View className="flex-row items-center gap-1 mt-1">
                          <View className="flex-1 h-1.5 bg-candy-surface rounded-pill overflow-hidden">
                            <View
                              className="h-full rounded-pill"
                              style={{
                                width: `${Math.min(bs.percentageUsed, 100)}%`,
                                backgroundColor: bs.isOverBudget
                                  ? "#e53e3e"
                                  : cat.color,
                              }}
                            />
                          </View>
                          <Text
                            className="text-candy-text-secondary"
                            style={{
                              fontSize: scaleFont(11, design.fontScale),
                            }}
                          >
                            {formatPercentage(bs.percentageUsed, 0)}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          className="text-candy-text-secondary"
                          style={{ fontSize: scaleFont(11, design.fontScale) }}
                        >
                          {cat.isDefault === 1
                            ? "Por defecto"
                            : "Personalizada"}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDelete(cat.id, cat.name, cat.isDefault)
                      }
                      className="w-8 h-8 items-center justify-center"
                    >
                      <FontAwesome
                        name="ellipsis-v"
                        size={16}
                        color="#907898"
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </CandyCard>
          )}
        </View>

        {/* Tip Banner */}
        <View className="mx-5 mb-8">
          <CandyCard variant="blue">
            <View className="flex-row items-center gap-3">
              <FontAwesome name="lightbulb-o" size={20} color="#0096cc" />
              <Text className="text-candy-text text-xs flex-1">
                Los usuarios que categorizan diariamente ahorran un 20% mas en
                promedio.
              </Text>
            </View>
          </CandyCard>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
