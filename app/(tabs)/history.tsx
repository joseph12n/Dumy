import {
  AnimatedNumber,
  FadeInView,
  ScalePress,
  StaggeredList,
} from "@/src/components/animated";
import {
  CandyButton,
  CandyCard,
  EmptyState,
} from "@/src/components/common";
import { MiniBarChart } from "@/src/components/finance";
import { useCategories } from "@/src/hooks/useCategories";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useSettingsStore } from "@/src/store/settingsStore";
import { useTransactionStore } from "@/src/store/transactionStore";
import { Transaction, UpdateTransactionInput } from "@/src/store/types";
import {
  applyShadow,
  getCornerRadius,
  resolveRuntimeDesign,
  scaleFont,
  toRgba,
} from "@/src/theme/designRuntime";
import {
  formatCOP,
  formatCOPCompact,
  formatPercentage,
} from "@/src/utils/currency";
import { formatDateShort } from "@/src/utils/dates";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "income" | "expense";

export default function HistoryScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  const [filter, setFilter] = useState<FilterType>("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, count: transactions.length };
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount));
    return Array.from(map.entries())
      .map(([catId, total]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          label: cat?.name.substring(0, 6) || "Otro",
          value: total,
          color: cat?.color || "#9CA3AF",
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions, categories]);

  const getCat = (id: string) => categories.find((c) => c.id === id);

  const handleDelete = (tx: Transaction) => {
    Alert.alert(
      "Eliminar transaccion",
      `¿Eliminar "${tx.description}"?\nMonto: ${formatCOP(tx.amount)}\nEsta accion no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteTransaction(tx.id),
        },
      ],
    );
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(String(tx.amount));
    setEditDescription(tx.description);
    setEditCategoryId(tx.categoryId);
  };

  const handleSaveEdit = async () => {
    if (!editingTx) return;
    const parsed = parseInt(editAmount.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) {
      Alert.alert("Error", "Monto invalido");
      return;
    }
    try {
      const input: UpdateTransactionInput = {
        id: editingTx.id,
        amount: parsed,
        description: editDescription.trim() || editingTx.description,
        categoryId: editCategoryId || editingTx.categoryId,
      };
      await updateTransaction(input);
      setEditingTx(null);
      Alert.alert("Listo", "Transaccion actualizada");
    } catch {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "income", label: "Ingresos" },
    { key: "expense", label: "Gastos" },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <FadeInView delay={30} className="mx-5 mt-4">
          <LinearGradient
            colors={design.gradients.hero.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5"
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              ...applyShadow(design.shadows.hero),
            }}
          >
            <Text
              className="text-white/80"
              style={{ fontSize: scaleFont(12, design.fontScale) }}
            >
              Historial financiero
            </Text>
            <Text
              className="text-white"
              style={{
                fontSize: scaleFont(24, design.fontScale),
                fontWeight: "800",
              }}
            >
              {stats.count} transacciones
            </Text>
            <View className="flex-row mt-3 gap-4">
              <View>
                <Text className="text-white/70" style={{ fontSize: scaleFont(10, design.fontScale) }}>
                  Ingresos
                </Text>
                <Text className="text-white font-bold" style={{ fontSize: scaleFont(14, design.fontScale) }}>
                  {formatCOPCompact(stats.income)}
                </Text>
              </View>
              <View>
                <Text className="text-white/70" style={{ fontSize: scaleFont(10, design.fontScale) }}>
                  Gastos
                </Text>
                <Text className="text-white font-bold" style={{ fontSize: scaleFont(14, design.fontScale) }}>
                  {formatCOPCompact(stats.expense)}
                </Text>
              </View>
              <View>
                <Text className="text-white/70" style={{ fontSize: scaleFont(10, design.fontScale) }}>
                  Balance
                </Text>
                <Text className="text-white font-bold" style={{ fontSize: scaleFont(14, design.fontScale) }}>
                  {formatCOPCompact(stats.balance)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </FadeInView>

        {/* Category Chart */}
        {categoryBreakdown.length > 0 && (
          <FadeInView delay={80} className="mx-5 mt-4">
            <Text className="text-candy-text font-bold mb-2" style={{ fontSize: scaleFont(14, design.fontScale) }}>
              Distribucion por categoria
            </Text>
            <CandyCard variant="glass" animated={false}>
              <MiniBarChart
                data={categoryBreakdown}
                height={70}
                formatValue={formatCOPCompact}
              />
            </CandyCard>
          </FadeInView>
        )}

        {/* Filter Tabs */}
        <FadeInView delay={100} className="mx-5 mt-4">
          <View className="flex-row gap-2">
            {filterOptions.map((opt) => {
              const active = filter === opt.key;
              return (
                <ScalePress
                  key={opt.key}
                  onPress={() => setFilter(opt.key)}
                  className="flex-1 py-2.5 items-center"
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
                      fontSize: scaleFont(13, design.fontScale),
                      fontWeight: "700",
                      color: active ? "#fff" : design.palette.textLight,
                    }}
                  >
                    {opt.label}
                  </Text>
                </ScalePress>
              );
            })}
          </View>
        </FadeInView>

        {/* Transaction List with Edit/Delete */}
        <FadeInView delay={150} className="mx-5 mt-4 mb-8">
          {filtered.length === 0 ? (
            <EmptyState
              icon="exchange"
              title="Sin transacciones"
              subtitle="Agrega tu primer ingreso o gasto para comenzar"
            />
          ) : (
            <CandyCard variant="glass" animated={false}>
              <StaggeredList staggerDelay={30}>
                {filtered.slice(0, 50).map((tx, idx) => {
                  const cat = getCat(tx.categoryId);
                  const isExpense = tx.type === "expense";
                  return (
                    <View
                      key={tx.id}
                      className={`flex-row items-center ${idx > 0 ? "mt-3 pt-3 border-t border-candy-outline-light" : ""}`}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: (cat?.color ?? "#9CA3AF") + "20" }}
                      >
                        <FontAwesome
                          name={(cat?.icon as any) || "tag"}
                          size={14}
                          color={cat?.color ?? "#9CA3AF"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-candy-text font-medium"
                          style={{ fontSize: scaleFont(13, design.fontScale) }}
                          numberOfLines={1}
                        >
                          {tx.description}
                        </Text>
                        <Text
                          className="text-candy-text-secondary"
                          style={{ fontSize: scaleFont(11, design.fontScale) }}
                        >
                          {cat?.name ?? "Sin categoría"} · {formatDateShort(tx.date)}
                        </Text>
                      </View>
                      <Text
                        className="font-bold mr-2"
                        style={{
                          fontSize: scaleFont(13, design.fontScale),
                          color: isExpense ? "#e53e3e" : "#22C55E",
                        }}
                      >
                        {isExpense ? "-" : "+"}{formatCOP(tx.amount)}
                      </Text>
                      {/* Edit button */}
                      <ScalePress
                        onPress={() => openEdit(tx)}
                        className="w-8 h-8 items-center justify-center mr-1"
                        style={{ borderRadius: 999, backgroundColor: toRgba(design.palette.primary, 0.1) }}
                      >
                        <FontAwesome name="pencil" size={12} color={design.palette.primary} />
                      </ScalePress>
                      {/* Delete button */}
                      <ScalePress
                        onPress={() => handleDelete(tx)}
                        className="w-8 h-8 items-center justify-center"
                        style={{ borderRadius: 999, backgroundColor: toRgba("#e53e3e", 0.1) }}
                      >
                        <FontAwesome name="trash-o" size={12} color="#e53e3e" />
                      </ScalePress>
                    </View>
                  );
                })}
              </StaggeredList>
            </CandyCard>
          )}
        </FadeInView>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editingTx !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingTx(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setEditingTx(null)}
          />
          <View
            className="p-6"
            style={{
              backgroundColor: design.palette.backgroundLight,
              borderTopLeftRadius: getCornerRadius(design.radius, "card"),
              borderTopRightRadius: getCornerRadius(design.radius, "card"),
              ...applyShadow(design.shadows.hero),
            }}
          >
            <Text className="text-candy-text font-bold text-lg mb-4">
              Editar Transaccion
            </Text>

            <Text className="text-candy-text-secondary text-xs font-semibold mb-1">
              Descripcion
            </Text>
            <TextInput
              className="bg-white border px-4 py-3 text-candy-text mb-3"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "card"),
                fontSize: scaleFont(14, design.fontScale),
              }}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Descripcion"
              placeholderTextColor={design.palette.borderDark}
            />

            <Text className="text-candy-text-secondary text-xs font-semibold mb-1">
              Monto (COP)
            </Text>
            <View
              className="flex-row items-center bg-white border px-4 mb-3"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "card"),
              }}
            >
              <Text className="text-candy-text text-lg font-bold mr-2">$</Text>
              <TextInput
                className="flex-1 py-3 text-candy-text"
                style={{ fontSize: scaleFont(16, design.fontScale) }}
                keyboardType="numeric"
                value={editAmount}
                onChangeText={setEditAmount}
              />
            </View>

            <Text className="text-candy-text-secondary text-xs font-semibold mb-2">
              Categoria
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const active = editCategoryId === cat.id;
                return (
                  <ScalePress
                    key={cat.id}
                    onPress={() => setEditCategoryId(cat.id)}
                    className="flex-row items-center gap-1.5 px-3 py-2"
                    style={{
                      borderRadius: getCornerRadius(design.radius, "pill"),
                      backgroundColor: active ? cat.color + "30" : design.palette.surfaceLight,
                      borderWidth: active ? 2 : 0,
                      borderColor: cat.color,
                    }}
                  >
                    <FontAwesome name={(cat.icon as any) || "tag"} size={12} color={cat.color} />
                    <Text style={{ fontSize: 12, fontWeight: "600", color: active ? cat.color : design.palette.textLight }}>
                      {cat.name}
                    </Text>
                  </ScalePress>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <CandyButton
                  title="Cancelar"
                  onPress={() => setEditingTx(null)}
                  variant="outline"
                />
              </View>
              <View className="flex-1">
                <CandyButton title="Guardar" onPress={handleSaveEdit} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
