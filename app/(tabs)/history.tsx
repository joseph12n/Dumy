import {
    AnimatedNumber,
    FadeInView,
    ScalePress,
    StaggeredList,
} from "@/src/components/animated";
import { CandyCard, EmptyState, IconBadge } from "@/src/components/common";
import { useFinancialSystem } from "@/src/hooks/useFinancialSystem";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    applyShadow,
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
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterType = "all" | "income" | "expense";

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 390;
  const [filter, setFilter] = useState<FilterType>("all");
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const now = new Date();
  const financial = useFinancialSystem({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const periodStats = financial.stats;
  const categoryBreakdown = financial.categoryBreakdown;
  const transactions = financial.transactions;

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const getCategoryInfo = (categoryId: string) =>
    financial.findCategoryById(categoryId);

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
        <FadeInView duration={300} slideFrom={8}>
          <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
            <View className="flex-row items-center gap-2">
              <LinearGradient
                colors={design.gradients.hero.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 38,
                  height: 38,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: getCornerRadius(design.radius, "pill"),
                }}
              >
                <Text className="text-white text-base font-bold">D</Text>
              </LinearGradient>
              <Text
                className="text-candy-text font-bold"
                style={{ fontSize: scaleFont(20, design.fontScale) }}
              >
                Historial
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Spending Distribution */}
        {categoryBreakdown.length > 0 && (
          <FadeInView delay={100} className="mx-5 mt-4">
            <CandyCard variant="pink" animated={false}>
              <Text
                className="text-candy-text font-medium mb-1"
                style={{ fontSize: scaleFont(13, design.fontScale) }}
              >
                Distribucion de Gastos
              </Text>
              <AnimatedNumber
                value={totalExpense}
                formatter={(n) => formatCOP(Math.round(n))}
                style={{
                  fontSize: scaleFont(24, design.fontScale),
                  fontWeight: "800",
                  color: design.palette.textLight,
                  marginBottom: 12,
                }}
              />

              {/* Progress bar */}
              <View
                className="flex-row h-3 overflow-hidden mb-3"
                style={{ borderRadius: getCornerRadius(design.radius, "pill") }}
              >
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

              {/* Legend */}
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
                    <Text className="text-candy-text text-xs" numberOfLines={1}>
                      {cat.categoryName} {formatPercentage(cat.percentage, 0)}
                    </Text>
                  </View>
                ))}
              </View>
            </CandyCard>
          </FadeInView>
        )}

        {/* Summary Cards */}
        <View className={`gap-3 mx-5 mt-4 ${isNarrow ? "" : "flex-row"}`}>
          <FadeInView delay={200} className="flex-1">
            <CandyCard
              variant="glass"
              animated={false}
              className="items-center py-3"
            >
              <IconBadge
                icon="arrow-down"
                color="#0096cc"
                bgColor="#c8eaff"
                size={16}
              />
              <AnimatedNumber
                value={periodStats?.totalIncome ?? 0}
                formatter={(n) => formatCOPCompact(Math.round(n))}
                style={{
                  fontSize: scaleFont(15, design.fontScale),
                  fontWeight: "700",
                  color: design.palette.textLight,
                  marginTop: 4,
                }}
              />
              <Text className="text-candy-text-secondary text-xs">
                Ingresos
              </Text>
            </CandyCard>
          </FadeInView>
          <FadeInView delay={250} className="flex-1">
            <CandyCard
              variant="glass"
              animated={false}
              className="items-center py-3"
            >
              <IconBadge
                icon="arrow-up"
                color="#e53e3e"
                bgColor="#ffe8e8"
                size={16}
              />
              <AnimatedNumber
                value={totalExpense}
                formatter={(n) => formatCOPCompact(Math.round(n))}
                style={{
                  fontSize: scaleFont(15, design.fontScale),
                  fontWeight: "700",
                  color: design.palette.textLight,
                  marginTop: 4,
                }}
              />
              <Text className="text-candy-text-secondary text-xs">Gastos</Text>
            </CandyCard>
          </FadeInView>
          <FadeInView delay={300} className="flex-1">
            <CandyCard
              variant="glass"
              animated={false}
              className="items-center py-3"
            >
              <IconBadge
                icon="bank"
                color="#7c52aa"
                bgColor="#eedcff"
                size={16}
              />
              <AnimatedNumber
                value={periodStats?.balance ?? 0}
                formatter={(n) => formatCOPCompact(Math.round(n))}
                style={{
                  fontSize: scaleFont(15, design.fontScale),
                  fontWeight: "700",
                  color: design.palette.textLight,
                  marginTop: 4,
                }}
              />
              <Text className="text-candy-text-secondary text-xs">Balance</Text>
            </CandyCard>
          </FadeInView>
        </View>

        {/* Filter Chips */}
        <FadeInView delay={350}>
          <View className="flex-row flex-wrap gap-2 mx-5 mt-5">
            {filters.map((f) => (
              <ScalePress
                key={f.key}
                onPress={() => setFilter(f.key)}
                scaleValue={0.95}
                className="px-4"
                style={{
                  minWidth: isNarrow ? 92 : undefined,
                  paddingVertical: design.density === "compact" ? 7 : 8,
                  borderRadius: getCornerRadius(design.radius, "pill"),
                  backgroundColor:
                    filter === f.key
                      ? design.palette.primary
                      : design.palette.surfaceLight,
                  ...(filter === f.key
                    ? applyShadow(design.shadows.button)
                    : {}),
                }}
              >
                <Text
                  className="font-semibold"
                  style={{
                    fontSize: scaleFont(13, design.fontScale),
                    color: filter === f.key ? "#fff" : design.palette.textLight,
                  }}
                  numberOfLines={1}
                >
                  {f.label}
                </Text>
              </ScalePress>
            ))}
          </View>
        </FadeInView>

        {/* Transaction List */}
        <FadeInView delay={400} className="mx-5 mt-4 mb-6">
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
            <CandyCard variant="glass" animated={false}>
              <StaggeredList staggerDelay={40}>
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
              </StaggeredList>
            </CandyCard>
          )}
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}
