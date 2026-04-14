import {
    AnimatedNumber,
    FadeInView,
    ScalePress,
    StaggeredList,
} from "@/src/components/animated";
import {
    BrandHeader,
    CandyCard,
    EmptyState,
    IconBadge,
} from "@/src/components/common";
import { useFinancialSystem } from "@/src/hooks/useFinancialSystem";
import { useSettingsStore } from "@/src/store/settingsStore";
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
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QuickActionItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  bg: string;
  onPress: () => void;
}

function QuickActionButton({
  item,
  radius,
  fontScale,
}: {
  item: QuickActionItem;
  radius: number;
  fontScale: number;
}) {
  return (
    <ScalePress
      onPress={item.onPress}
      className="w-full"
      style={{
        width: "100%",
        minHeight: 98,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: radius,
        backgroundColor: item.bg,
      }}
    >
      <View
        className="w-10 h-10 items-center justify-center"
        style={{
          borderRadius: 999,
          backgroundColor: toRgba(item.color, 0.16),
        }}
      >
        <FontAwesome name={item.icon} size={18} color={item.color} />
      </View>
      <Text
        className="font-semibold mt-2 text-center"
        style={{
          color: item.color,
          fontSize: scaleFont(12, fontScale),
        }}
        numberOfLines={1}
      >
        {item.label}
      </Text>
    </ScalePress>
  );
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 390;
  const isMobile = width < 768;
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const now = new Date();
  const financial = useFinancialSystem({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const periodStats = financial.stats;
  const categoryBreakdown = financial.categoryBreakdown;
  const trends = financial.trends;
  const budgetStatus = financial.budgetStatus;
  const recentTransactions = financial.recentTransactions.slice(0, 5);

  const balance = periodStats?.balance ?? 0;
  const totalIncome = periodStats?.totalIncome ?? 0;
  const totalExpense = periodStats?.totalExpense ?? 0;
  const trendPercent = trends?.monthOverMonth ?? 0;

  const getCategoryInfo = (categoryId: string) =>
    financial.findCategoryById(categoryId);

  const quickActions = [
    {
      key: "add",
      label: "Agregar",
      icon: "plus-circle" as const,
      color: design.palette.primary,
      bg: toRgba(design.palette.primary, 0.12),
      onPress: () => router.push("/add"),
    },
    {
      key: "scan",
      label: "Escanear",
      icon: "camera" as const,
      color: design.palette.secondary,
      bg: toRgba(design.palette.secondary, 0.12),
      onPress: () => router.push("/scan"),
    },
    {
      key: "reports",
      label: "Reportes",
      icon: "bar-chart" as const,
      color: design.palette.secondary,
      bg: toRgba(design.palette.secondary, 0.12),
      onPress: () => router.push("/history"),
    },
  ];

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
          onRightPress={() => router.push("../modal")}
        />

        {/* Hero Balance Card with Gradient */}
        <FadeInView delay={100} slideFrom={24}>
          <LinearGradient
            colors={design.gradients.hero.colors}
            start={design.gradients.hero.start}
            end={design.gradients.hero.end}
            className="mx-5 mt-4 p-6"
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              ...applyShadow(design.shadows.hero),
            }}
          >
            <Text
              className="text-white/80 font-medium mb-1"
              style={{ fontSize: scaleFont(13, design.fontScale) }}
            >
              Balance del mes
            </Text>
            <AnimatedNumber
              value={balance}
              formatter={(n) => formatCOP(Math.round(n))}
              style={{
                fontSize: scaleFont(32, design.fontScale),
                fontWeight: "800",
                color: "#ffffff",
              }}
            />
            <View className="flex-row items-center mt-3 gap-2">
              <View
                className="flex-row items-center gap-1 px-3 py-1 rounded-full"
                style={{
                  backgroundColor:
                    trendPercent >= 0
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,100,100,0.3)",
                }}
              >
                <FontAwesome
                  name={trendPercent >= 0 ? "arrow-up" : "arrow-down"}
                  size={10}
                  color="#fff"
                />
                <Text
                  className="text-white font-semibold"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  {formatPercentage(Math.abs(trendPercent))}
                </Text>
              </View>
              <Text
                className="text-white/70"
                style={{ fontSize: scaleFont(12, design.fontScale) }}
              >
                vs mes anterior
              </Text>
            </View>
          </LinearGradient>
        </FadeInView>

        {/* Income / Expense Cards */}
        <View className={`gap-3 mx-5 mt-4 ${isNarrow ? "" : "flex-row"}`}>
          <FadeInView delay={200} className="flex-1">
            <CandyCard
              variant="glass"
              animated={false}
              className="flex-row items-center gap-3"
            >
              <IconBadge
                icon="arrow-down"
                color={design.palette.secondary}
                bgColor={toRgba(design.palette.secondary, 0.2)}
              />
              <View>
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                >
                  Ingresos
                </Text>
                <AnimatedNumber
                  value={totalIncome}
                  formatter={(n) => formatCOPCompact(Math.round(n))}
                  style={{
                    fontSize: scaleFont(16, design.fontScale),
                    fontWeight: "700",
                    color: design.palette.textLight,
                  }}
                />
              </View>
            </CandyCard>
          </FadeInView>
          <FadeInView delay={250} className="flex-1">
            <CandyCard
              variant="glass"
              animated={false}
              className="flex-row items-center gap-3"
            >
              <IconBadge icon="arrow-up" color="#e53e3e" bgColor="#ffe8e8" />
              <View>
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(11, design.fontScale) }}
                >
                  Gastos
                </Text>
                <AnimatedNumber
                  value={totalExpense}
                  formatter={(n) => formatCOPCompact(Math.round(n))}
                  style={{
                    fontSize: scaleFont(16, design.fontScale),
                    fontWeight: "700",
                    color: design.palette.textLight,
                  }}
                />
              </View>
            </CandyCard>
          </FadeInView>
        </View>

        {/* Quick Actions */}
        <FadeInView delay={300}>
          <View
            className="mx-5 mt-5 flex-row flex-wrap justify-between"
            style={{ rowGap: 12 }}
          >
            {quickActions.map((action) => (
              <View
                key={action.key}
                style={{
                  width: isMobile
                    ? action.key === "reports"
                      ? "100%"
                      : "48.5%"
                    : "31.5%",
                }}
              >
                <QuickActionButton
                  item={action}
                  radius={getCornerRadius(design.radius, "card")}
                  fontScale={design.fontScale}
                />
              </View>
            ))}
          </View>
        </FadeInView>

        {/* Budget Alerts */}
        {budgetStatus.filter((b) => b.isOverBudget).length > 0 && (
          <FadeInView delay={350} className="mx-5 mt-5">
            <CandyCard
              variant="default"
              animated={false}
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
          </FadeInView>
        )}

        {/* Top Categories */}
        {categoryBreakdown.length > 0 && (
          <FadeInView delay={400} className="mx-5 mt-5">
            <Text className="text-candy-text text-base font-bold mb-3">
              Top Categorias
            </Text>
            <CandyCard variant="glass" animated={false}>
              <StaggeredList staggerDelay={60}>
                {categoryBreakdown.slice(0, 3).map((cat, idx) => (
                  <View
                    key={cat.categoryId}
                    className={`flex-row items-center justify-between ${idx > 0 ? "mt-3 pt-3 border-t border-candy-outline-light" : ""}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: cat.categoryColor + "20" }}
                      >
                        <FontAwesome
                          name={(cat.categoryIcon as any) || "tag"}
                          size={14}
                          color={cat.categoryColor}
                        />
                      </View>
                      <Text
                        className="text-candy-text text-sm font-medium"
                        numberOfLines={1}
                      >
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
              </StaggeredList>
            </CandyCard>
          </FadeInView>
        )}

        {/* Recent Transactions */}
        <FadeInView delay={450} className="mx-5 mt-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-candy-text text-base font-bold">
              Transacciones Recientes
            </Text>
            <ScalePress onPress={() => router.push("/history")} haptic={false}>
              <Text
                className="text-sm font-semibold"
                style={{ color: design.palette.primary }}
              >
                Ver todo
              </Text>
            </ScalePress>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="exchange"
              title="Sin transacciones"
              subtitle="Agrega tu primer ingreso o gasto"
            />
          ) : (
            <CandyCard variant="glass" animated={false}>
              <StaggeredList staggerDelay={50}>
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
              </StaggeredList>
            </CandyCard>
          )}
        </FadeInView>

        {/* Motivational Banner */}
        <FadeInView delay={500} className="mx-5 mb-8">
          <LinearGradient
            colors={design.gradients.secondary.colors}
            start={design.gradients.secondary.start}
            end={design.gradients.secondary.end}
            className="p-5"
            style={{
              borderRadius: getCornerRadius(design.radius, "card"),
              ...applyShadow(design.shadows.card),
            }}
          >
            <Text
              className="text-white font-semibold text-center"
              style={{ fontSize: scaleFont(14, design.fontScale) }}
            >
              Registra tus gastos diarios y mejora tu control con la linea
              grafica Dumy.
            </Text>
          </LinearGradient>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}
