import { CandyCard, EmptyState, IconBadge } from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import { useMonthlyStats } from "@/src/hooks/useStats";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import {
    formatCOP,
    formatCOPCompact,
    formatPercentage,
} from "@/src/utils/currency";
import { formatDateShort } from "@/src/utils/dates";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "income" | "expense";

export default function HistoryScreen() {
  const [filter, setFilter] = useState<FilterType>("all");
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const now = new Date();
  const { periodStats, categoryBreakdown } = useMonthlyStats(
    now.getFullYear(),
    now.getMonth() + 1,
  );
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const getCategoryInfo = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  const totalExpense = periodStats?.totalExpense ?? 0;

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todo" },
    { key: "expense", label: "Gastos" },
    { key: "income", label: "Ingresos" },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <View className="flex-row items-center gap-2">
            <View
              className="w-9 h-9 items-center justify-center"
              style={{
                borderRadius: getCornerRadius(design.radius, "pill"),
                backgroundColor: design.palette.primary,
              }}
            >
              <Text className="text-white text-base font-bold">D</Text>
            </View>
            <Text
              className="text-candy-text font-bold"
              style={{ fontSize: scaleFont(20, design.fontScale) }}
            >
              Historial
            </Text>
          </View>
        </View>

        {/* Spending Mix */}
        {categoryBreakdown.length > 0 && (
          <View className="mx-5 mt-4">
            <CandyCard variant="pink">
              <Text
                className="text-candy-text font-medium mb-1"
                style={{ fontSize: scaleFont(13, design.fontScale) }}
              >
                Distribucion de Gastos
              </Text>
              <Text
                className="text-candy-text font-bold mb-3"
                style={{ fontSize: scaleFont(23, design.fontScale) }}
              >
                {formatCOP(totalExpense)}
              </Text>

              {/* Progress bar showing category distribution */}
              <View className="flex-row h-3 rounded-pill overflow-hidden mb-3">
                {categoryBreakdown.slice(0, 4).map((cat) => (
                  <View
                    key={cat.categoryId}
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.categoryColor,
                    }}
                  />
                ))}
              </View>

              {/* Category legend */}
              <View className="flex-row flex-wrap gap-3">
                {categoryBreakdown.slice(0, 4).map((cat) => (
                  <View
                    key={cat.categoryId}
                    className="flex-row items-center gap-1"
                  >
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.categoryColor }}
                    />
                    <Text className="text-candy-text text-xs">
                      {cat.categoryName} {formatPercentage(cat.percentage, 0)}
                    </Text>
                  </View>
                ))}
              </View>
            </CandyCard>
          </View>
        )}

        {/* Summary Cards */}
        <View className="flex-row gap-3 mx-5 mt-4">
          <CandyCard variant="glass" className="flex-1 items-center py-3">
            <IconBadge
              icon="arrow-down"
              color="#0096cc"
              bgColor="#c8eaff"
              size={16}
            />
            <Text className="text-candy-text font-bold mt-1">
              {formatCOPCompact(periodStats?.totalIncome ?? 0)}
            </Text>
            <Text className="text-candy-text-secondary text-xs">Ingresos</Text>
          </CandyCard>
          <CandyCard variant="glass" className="flex-1 items-center py-3">
            <IconBadge
              icon="arrow-up"
              color="#e53e3e"
              bgColor="#ffe8e8"
              size={16}
            />
            <Text className="text-candy-text font-bold mt-1">
              {formatCOPCompact(totalExpense)}
            </Text>
            <Text className="text-candy-text-secondary text-xs">Gastos</Text>
          </CandyCard>
          <CandyCard variant="glass" className="flex-1 items-center py-3">
            <IconBadge
              icon="bank"
              color="#7c52aa"
              bgColor="#eedcff"
              size={16}
            />
            <Text className="text-candy-text font-bold mt-1">
              {formatCOPCompact(periodStats?.balance ?? 0)}
            </Text>
            <Text className="text-candy-text-secondary text-xs">Balance</Text>
          </CandyCard>
        </View>

        {/* Filter Chips */}
        <View className="flex-row gap-2 mx-5 mt-5">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className="px-4"
              style={{
                paddingVertical: design.density === "compact" ? 7 : 8,
                borderRadius: getCornerRadius(design.radius, "pill"),
                backgroundColor:
                  filter === f.key
                    ? design.palette.primary
                    : design.palette.surfaceLight,
              }}
            >
              <Text
                className="font-semibold"
                style={{
                  fontSize: scaleFont(13, design.fontScale),
                  color: filter === f.key ? "#fff" : "#604868",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        <View className="mx-5 mt-4 mb-6">
          <Text className="text-candy-text text-base font-bold mb-3">
            Transacciones ({filtered.length})
          </Text>

          {filtered.length === 0 ? (
            <EmptyState
              icon="list"
              title="Sin transacciones"
              subtitle="No hay registros para este filtro"
            />
          ) : (
            <CandyCard variant="glass">
              {filtered.map((tx, idx) => {
                const cat = getCategoryInfo(tx.categoryId);
                const isExpense = tx.type === "expense";
                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center justify-between ${idx > 0 ? "mt-3 pt-3 border-t border-candy-outline-light" : ""}`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: (cat?.color ?? "#e040a0") + "20",
                        }}
                      >
                        <FontAwesome
                          name={(cat?.icon as any) || "tag"}
                          size={16}
                          color={cat?.color ?? "#e040a0"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-candy-text text-sm font-medium"
                          numberOfLines={1}
                        >
                          {tx.description}
                        </Text>
                        <Text className="text-candy-text-secondary text-xs">
                          {cat?.name ?? "Sin categoria"} ·{" "}
                          {formatDateShort(tx.date)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className={`text-sm font-bold ${isExpense ? "text-candy-error" : "text-candy-blue"}`}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCOP(tx.amount)}
                    </Text>
                  </View>
                );
              })}
            </CandyCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
