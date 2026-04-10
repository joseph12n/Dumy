import {
    BrandHeader,
    CandyCard,
    EmptyState,
    IconBadge,
} from "@/src/components/common";
import { useCategories } from "@/src/hooks/useCategories";
import { useMonthlyStats } from "@/src/hooks/useStats";
import { useRecentTransactions } from "@/src/hooks/useTransactions";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
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
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const now = new Date();
  const { periodStats, categoryBreakdown, trends, budgetStatus } =
    useMonthlyStats(now.getFullYear(), now.getMonth() + 1);
  const recentTransactions = useRecentTransactions(5);
  const { categories } = useCategories();

  const balance = periodStats?.balance ?? 0;
  const totalIncome = periodStats?.totalIncome ?? 0;
  const totalExpense = periodStats?.totalExpense ?? 0;
  const trendPercent = trends?.monthOverMonth ?? 0;

  const getCategoryInfo = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <BrandHeader
          title="Dumy"
          subtitle="Control financiero local-first"
          rightIcon="cog"
          onRightPress={() => router.push("/modal")}
        />

        {/* Balance Card */}
        <View
          className="mx-5 mt-4 p-5"
          style={{
            borderRadius: getCornerRadius(design.radius, "card"),
            backgroundColor: design.palette.primary,
          }}
        >
          <Text
            className="text-white/80 font-medium mb-1"
            style={{ fontSize: scaleFont(13, design.fontScale) }}
          >
            Balance del mes
          </Text>
          <Text
            className="text-white font-bold"
            style={{ fontSize: scaleFont(30, design.fontScale) }}
          >
            {formatCOP(balance)}
          </Text>
          <View className="flex-row items-center mt-2 gap-1">
            <FontAwesome
              name={trendPercent >= 0 ? "arrow-up" : "arrow-down"}
              size={12}
              color={trendPercent >= 0 ? "#c8eaff" : "#ffe8e8"}
            />
            <Text
              className="text-white/90"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              {formatPercentage(Math.abs(trendPercent))} vs mes anterior
            </Text>
          </View>
        </View>

        {/* Income / Expense Cards */}
        <View className="flex-row gap-3 mx-5 mt-4">
          <CandyCard
            variant="glass"
            className="flex-1 flex-row items-center gap-3"
          >
            <IconBadge icon="arrow-down" color="#0096cc" bgColor="#c8eaff" />
            <View>
              <Text
                className="text-candy-text-secondary"
                style={{ fontSize: scaleFont(11, design.fontScale) }}
              >
                Ingresos
              </Text>
              <Text
                className="text-candy-text font-bold"
                style={{ fontSize: scaleFont(16, design.fontScale) }}
              >
                {formatCOPCompact(totalIncome)}
              </Text>
            </View>
          </CandyCard>
          <CandyCard
            variant="glass"
            className="flex-1 flex-row items-center gap-3"
          >
            <IconBadge icon="arrow-up" color="#e53e3e" bgColor="#ffe8e8" />
            <View>
              <Text
                className="text-candy-text-secondary"
                style={{ fontSize: scaleFont(11, design.fontScale) }}
              >
                Gastos
              </Text>
              <Text
                className="text-candy-text font-bold"
                style={{ fontSize: scaleFont(16, design.fontScale) }}
              >
                {formatCOPCompact(totalExpense)}
              </Text>
            </View>
          </CandyCard>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mx-5 mt-5">
          <TouchableOpacity
            onPress={() => router.push("/add")}
            className="flex-1 items-center py-4 gap-2"
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              backgroundColor: toRgba(design.palette.primary, 0.16),
            }}
          >
            <FontAwesome
              name="plus-circle"
              size={24}
              color={design.palette.primary}
            />
            <Text
              className="text-xs font-semibold"
              style={{ color: design.palette.primary }}
            >
              Agregar Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/scan")}
            className="flex-1 items-center py-4 gap-2"
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              backgroundColor: toRgba(design.palette.secondary, 0.16),
            }}
          >
            <FontAwesome
              name="camera"
              size={24}
              color={design.palette.secondary}
            />
            <Text
              className="text-xs font-semibold"
              style={{ color: design.palette.secondary }}
            >
              Escanear Recibo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/history")}
            className="flex-1 items-center py-4 gap-2"
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              backgroundColor: toRgba("#0096cc", 0.16),
            }}
          >
            <FontAwesome name="bar-chart" size={24} color="#0096cc" />
            <Text className="text-candy-blue text-xs font-semibold">
              Reportes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Budget Alerts */}
        {budgetStatus.filter((b) => b.isOverBudget).length > 0 && (
          <View className="mx-5 mt-5">
            <CandyCard
              variant="default"
              className="border-candy-error bg-candy-error-bg"
            >
              <View className="flex-row items-center gap-2">
                <FontAwesome
                  name="exclamation-triangle"
                  size={16}
                  color="#e53e3e"
                />
                <Text className="text-candy-error text-sm font-semibold">
                  {budgetStatus.filter((b) => b.isOverBudget).length}{" "}
                  presupuesto(s) excedido(s)
                </Text>
              </View>
            </CandyCard>
          </View>
        )}

        {/* Top Categories */}
        {categoryBreakdown.length > 0 && (
          <View className="mx-5 mt-5">
            <Text className="text-candy-text text-base font-bold mb-3">
              Top Categorias
            </Text>
            <CandyCard variant="glass">
              {categoryBreakdown.slice(0, 3).map((cat, idx) => (
                <View
                  key={cat.categoryId}
                  className={`flex-row items-center justify-between ${idx > 0 ? "mt-3 pt-3 border-t border-candy-outline-light" : ""}`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: cat.categoryColor + "20" }}
                    >
                      <FontAwesome
                        name={(cat.categoryIcon as any) || "tag"}
                        size={14}
                        color={cat.categoryColor}
                      />
                    </View>
                    <Text className="text-candy-text text-sm font-medium">
                      {cat.categoryName}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-candy-text text-sm font-bold">
                      {formatCOPCompact(cat.totalSpent)}
                    </Text>
                    <Text className="text-candy-text-secondary text-xs">
                      {formatPercentage(cat.percentage, 0)}
                    </Text>
                  </View>
                </View>
              ))}
            </CandyCard>
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mx-5 mt-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-candy-text text-base font-bold">
              Transacciones Recientes
            </Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text
                className="text-sm font-semibold"
                style={{ color: design.palette.primary }}
              >
                Ver todo
              </Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="exchange"
              title="Sin transacciones"
              subtitle="Agrega tu primer ingreso o gasto"
            />
          ) : (
            <CandyCard variant="glass">
              {recentTransactions.map((tx, idx) => {
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

        {/* Motivational Banner */}
        <View
          className="mx-5 mb-8 p-4"
          style={{
            borderRadius: getCornerRadius(design.radius, "card"),
            backgroundColor: design.palette.secondary,
          }}
        >
          <Text
            className="text-white font-medium text-center"
            style={{ fontSize: scaleFont(13, design.fontScale) }}
          >
            Registra tus gastos diarios y mejora tu control con la linea grafica
            Dumy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
