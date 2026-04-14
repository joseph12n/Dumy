import { FadeInView, ScalePress } from "@/src/components/animated";
import { BrandHeader, CandyButton } from "@/src/components/common";
import { useFinancialSystem } from "@/src/hooks/useFinancialSystem";
import { useSettingsStore } from "@/src/store/settingsStore";
import { CreateTransactionInput, TransactionType } from "@/src/store/types";
import {
    applyShadow,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import { parseCOPInput } from "@/src/utils/currency";
import { todayISO } from "@/src/utils/dates";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export default function AddTransactionScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 390;
  const router = useRouter();
  const financial = useFinancialSystem();
  const addTransaction = financial.addTransaction;
  const categories = financial.categories;
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount.trim()) {
      Alert.alert("Error", "Ingresa un monto");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Ingresa una descripcion");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("Error", "Selecciona una categoria");
      return;
    }
    if (!isValidISODate(date)) {
      Alert.alert("Error", "Ingresa una fecha valida en formato YYYY-MM-DD");
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedAmount = parseCOPInput(amount);

      const input: CreateTransactionInput = {
        amount: parsedAmount,
        description: description.trim(),
        categoryId: selectedCategoryId,
        date,
        type,
        receiptImagePath: null,
      };

      await addTransaction(input);
      Alert.alert("Listo", "Transaccion guardada", [
        { text: "OK", onPress: () => router.push("/") },
      ]);
    } catch (err) {
      Alert.alert("Error", "No se pudo guardar la transaccion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <BrandHeader title="Dumy" subtitle="Registro de transacciones" />

          {/* Title */}
          <FadeInView delay={100} className="px-5 mt-4">
            <Text
              className="text-candy-text font-bold"
              style={{ fontSize: scaleFont(24, design.fontScale) }}
            >
              Nueva Transaccion
            </Text>
            <Text
              className="text-candy-text-secondary mt-1"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Registra tu gasto o ingreso siguiendo la linea grafica Dumy.
            </Text>
          </FadeInView>

          {/* Upload / Manual buttons */}
          <FadeInView delay={150}>
            <View className={`mx-5 mt-5 gap-3 ${isNarrow ? "" : "flex-row"}`}>
              <ScalePress
                onPress={() => router.push("/scan")}
                className={`items-center py-5 gap-2 ${isNarrow ? "" : "flex-1"}`}
                style={{
                  width: isNarrow ? "100%" : undefined,
                  borderRadius: getCornerRadius(design.radius, "card"),
                  backgroundColor: design.palette.surfaceLight,
                  ...applyShadow(design.shadows.card),
                }}
              >
                <FontAwesome
                  name="camera"
                  size={28}
                  color={design.palette.secondary}
                />
                <Text
                  className="font-semibold"
                  style={{
                    color: design.palette.secondary,
                    fontSize: scaleFont(13, design.fontScale),
                  }}
                >
                  Subir Recibo
                </Text>
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                >
                  Escaneo visual guiado
                </Text>
              </ScalePress>
              <ScalePress
                className={`items-center py-5 gap-2 border-2 ${isNarrow ? "" : "flex-1"}`}
                style={{
                  width: isNarrow ? "100%" : undefined,
                  borderRadius: getCornerRadius(design.radius, "card"),
                  borderColor: design.palette.primary,
                  backgroundColor: `${design.palette.primary}15`,
                  ...applyShadow(design.shadows.card),
                }}
              >
                <FontAwesome
                  name="pencil-square-o"
                  size={28}
                  color={design.palette.primary}
                />
                <Text
                  className="font-semibold"
                  style={{
                    color: design.palette.primary,
                    fontSize: scaleFont(13, design.fontScale),
                  }}
                >
                  Manual
                </Text>
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                  numberOfLines={2}
                >
                  Llena los detalles
                </Text>
              </ScalePress>
            </View>
          </FadeInView>

          {/* Transaction Type */}
          <FadeInView delay={200} className="mx-5 mt-6">
            <Text
              className="text-candy-text font-semibold mb-2"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Tipo
            </Text>
            <View className="flex-row gap-2">
              {[
                {
                  key: "expense" as const,
                  label: "Gasto",
                  icon: "arrow-up" as const,
                  color: "#e53e3e",
                },
                {
                  key: "income" as const,
                  label: "Ingreso",
                  icon: "arrow-down" as const,
                  color: design.palette.secondary,
                },
              ].map((t) => (
                <ScalePress
                  key={t.key}
                  onPress={() => setType(t.key)}
                  scaleValue={0.96}
                  className="flex-1 flex-row items-center justify-center gap-2"
                  style={{
                    borderRadius: getCornerRadius(design.radius, "pill"),
                    paddingVertical: design.density === "compact" ? 10 : 12,
                    backgroundColor:
                      type === t.key
                        ? design.palette.primary
                        : design.palette.surfaceLight,
                    ...(type === t.key
                      ? applyShadow(design.shadows.button)
                      : {}),
                  }}
                >
                  <FontAwesome
                    name={t.icon}
                    size={14}
                    color={type === t.key ? "#fff" : t.color}
                  />
                  <Text
                    className="font-semibold"
                    style={{
                      color: type === t.key ? "#fff" : design.palette.textLight,
                      fontSize: scaleFont(13, design.fontScale),
                    }}
                  >
                    {t.label}
                  </Text>
                </ScalePress>
              ))}
            </View>
          </FadeInView>

          {/* Amount */}
          <FadeInView delay={250} className="mx-5 mt-5">
            <Text
              className="text-candy-text font-semibold mb-2"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Monto (COP)
            </Text>
            <View
              className="flex-row items-center bg-white border px-4"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "card"),
                ...applyShadow(design.shadows.card),
              }}
            >
              <Text className="text-candy-text text-lg font-bold mr-2">$</Text>
              <TextInput
                className="flex-1 py-3 text-candy-text"
                style={{ fontSize: scaleFont(18, design.fontScale) }}
                placeholder="0"
                placeholderTextColor={design.palette.borderDark}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </FadeInView>

          {/* Description */}
          <FadeInView delay={300} className="mx-5 mt-4">
            <Text
              className="text-candy-text font-semibold mb-2"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Descripcion
            </Text>
            <TextInput
              className="bg-white border px-4 py-3 text-candy-text"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "card"),
                fontSize: scaleFont(15, design.fontScale),
                ...applyShadow(design.shadows.card),
              }}
              placeholder="Ej: Almuerzo en restaurante"
              placeholderTextColor={design.palette.borderDark}
              value={description}
              onChangeText={setDescription}
            />
          </FadeInView>

          {/* Date */}
          <FadeInView delay={350} className="mx-5 mt-4">
            <Text
              className="text-candy-text font-semibold mb-2"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Fecha
            </Text>
            <View
              className="flex-row items-center bg-white border px-4 py-3"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "card"),
                ...applyShadow(design.shadows.card),
              }}
            >
              <FontAwesome name="calendar" size={16} color="#604868" />
              <TextInput
                className="flex-1 ml-3 text-candy-text"
                style={{ fontSize: scaleFont(15, design.fontScale) }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={design.palette.borderDark}
                value={date}
                onChangeText={setDate}
              />
            </View>
          </FadeInView>

          {/* Category Selection */}
          <FadeInView delay={400} className="mx-5 mt-4">
            <Text
              className="text-candy-text font-semibold mb-2"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Categoria
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <ScalePress
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  scaleValue={0.95}
                  className="flex-row items-center gap-2 px-3"
                  style={{
                    borderRadius: getCornerRadius(design.radius, "pill"),
                    paddingVertical: design.density === "compact" ? 7 : 8,
                    backgroundColor:
                      selectedCategoryId === cat.id
                        ? design.palette.primary
                        : design.palette.surfaceLight,
                    borderWidth: selectedCategoryId === cat.id ? 0 : 1,
                    borderColor: design.palette.borderLight,
                    ...(selectedCategoryId === cat.id
                      ? applyShadow(design.shadows.button)
                      : {}),
                  }}
                >
                  <FontAwesome
                    name={(cat.icon as any) || "tag"}
                    size={12}
                    color={selectedCategoryId === cat.id ? "#fff" : cat.color}
                  />
                  <Text
                    className="font-medium"
                    style={{
                      fontSize: scaleFont(13, design.fontScale),
                      color:
                        selectedCategoryId === cat.id
                          ? "#fff"
                          : design.palette.textLight,
                    }}
                  >
                    {cat.name}
                  </Text>
                </ScalePress>
              ))}
            </View>
          </FadeInView>

          {/* Submit */}
          <FadeInView delay={450} className="mx-5 mt-6 mb-8">
            <CandyButton
              title="Guardar Transaccion"
              icon={<FontAwesome name="check" size={16} color="#fff" />}
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
            />
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
