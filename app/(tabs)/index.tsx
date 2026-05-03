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
import { MiniBarChart, SpendingTimeline, WeeklySummaryCard } from "@/src/components/finance";
import { useFinancialSystem } from "@/src/hooks/useFinancialSystem";
import { useSavingsStore } from "@/src/store/savingsStore";
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
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, useWindowDimensions, View } from "react-native";
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

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

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
  const totalSaved = useSavingsStore((s) =>
    s.goals.reduce((sum, g) => sum + g.currentAmount, 0),
  );
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

  // Compute last 7 days spending
  const last7DaysData = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayExpense = financial.transactions
        .filter((t) => t.date === dateStr && t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      days.push({
        label: DAY_LABELS[d.getDay()],
        expense: dayExpense,
        isToday: i === 0,
      });
    }
    return days;
  }, [financial.transactions]);

  // Compute current week vs previous week
  const weeklyData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekEnd.getDate() - 6);
    const prevStartStr = prevWeekStart.toISOString().slice(0, 10);
    const prevEndStr = prevWeekEnd.toISOString().slice(0, 10);

    let weekIncome = 0;
    let weekExpense = 0;
    let prevWeekExpense = 0;

    for (const t of financial.transactions) {
      if (t.date >= weekStartStr && t.date <= todayStr) {
        if (t.type === 'income') weekIncome += t.amount;
        else weekExpense += t.amount;
      } else if (t.date >= prevStartStr && t.date <= prevEndStr) {
        if (t.type === 'expense') prevWeekExpense += t.amount;
      }
    }

    return { weekIncome, weekExpense, prevWeekExpense };
  }, [financial.transactions]);

  // Category chart data
  const chartData = useMemo(
    () =>
      categoryBreakdown.slice(0, 5).map((c) => ({
        label: c.categoryName.substring(0, 6),
        value: c.totalSpent,
        color: c.categoryColor,
      })),
    [categoryBreakdown],
  );

  // Financial health score (0-100)
  const healthScore = useMemo(() => {
    if (totalIncome === 0) return 0;
    const savingsRate = Math.max(0, (balance / totalIncome) * 100);
    const budgetPenalty =
      budgetStatus.filter((b) => b.isOverBudget).length * 10;
    return Math.max(0, Math.min(100, Math.round(savingsRate * 2 - budgetPenalty)));
  }, [totalIncome, balance, budgetStatus]);

  const handleDeleteTransaction = (id: string, description: string) => {
    Alert.alert(
      "Eliminar transaccion",
      `¿Eliminar "${description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => financial.deleteTransaction(id),
        },
      ],
    );
  };

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
      key: "savings",
      label: "Ahorros",
      icon: "bookmark" as const,
      color: "#059669",
      bg: toRgba("#059669", 0.12),
      onPress: () => router.push("/savings"),
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

        {/* Income / Expense / Savings Cards */}
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

        {/* Savings mini card */}
        {totalSaved > 0 && (
          <FadeInView delay={260} className="mx-5 mt-3">
            <ScalePress onPress={() => router.push("/savings")}>
              <CandyCard variant="glass" animated={false} className="flex-row items-center gap-3">
                <IconBadge icon="bookmark" color="#059669" bgColor={toRgba("#059669", 0.15)} />
                <View className="flex-1">
                  <Text className="text-candy-text-secondary" style={{ fontSize: scaleFont(11, design.fontScale) }}>
                    Ahorros acumulados
                  </Text>
                  <AnimatedNumber
                    value={totalSaved}
                    formatter={(n) => formatCOPCompact(Math.round(n))}
                    style={{ fontSize: scaleFont(16, design.fontScale), fontWeight: "700", color: "#059669" }}
                  />
                </View>
                <FontAwesome name="chevron-right" size={12} color={design.palette.borderDark} />
              </CandyCard>
            </ScalePress>
          </FadeInView>
        )}

        {/* Quick Actions */}
        <FadeInView delay={300}>
          <View
            className="mx-5 mt-5 flex-row flex-wrap justify-between"
            style={{ rowGap: 12 }}
          >
            {quickActions.map((action) => (
              <View
                key={action.key}
                style={{ width: isMobile ? "48.5%" : "23.5%" }}
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

        {/* Financial Health Score */}
        {totalIncome > 0 && (
          <FadeInView delay={320} className="mx-5 mt-5">
            <CandyCard variant="glass" animated={false}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-candy-text font-bold" style={{ fontSize: scaleFont(14, design.fontScale) }}>
                    Salud Financiera
                  </Text>
                  <Text className="text-candy-text-secondary" style={{ fontSize: scaleFont(11, design.fontScale) }}>
                    Basado en balance y presupuestos
                  </Text>
                </View>
                <View
                  className="items-center justify-center"
                  style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: healthScore >= 60 ? toRgba("#22C55E", 0.15) : healthScore >= 30 ? toRgba("#F59E0B", 0.15) : toRgba("#EF4444", 0.15),
                  }}
                >
                  <Text style={{
                    fontSize: scaleFont(16, design.fontScale),
                    fontWeight: "800",
                    color: healthScore >= 60 ? "#22C55E" : healthScore >= 30 ? "#F59E0B" : "#EF4444",
                  }}>
                    {healthScore}
                  </Text>
                </View>
              </View>
              {/* Health bar */}
              <View className="mt-3 h-2 overflow-hidden" style={{ backgroundColor: design.palette.surfaceLight, borderRadius: 999 }}>
                <View style={{
                  width: `${healthScore}%`, height: "100%", borderRadius: 999,
                  backgroundColor: healthScore >= 60 ? "#22C55E" : healthScore >= 30 ? "#F59E0B" : "#EF4444",
                }} />
              </View>
            </CandyCard>
          </FadeInView>
        )}

        {/* Spending Timeline (7 days) */}
        {last7DaysData.some((d) => d.expense > 0) && (
          <FadeInView delay={340} className="mx-5 mt-5">
            <Text className="text-candy-text text-base font-bold mb-3">
              Gastos ultimos 7 dias
            </Text>
            <CandyCard variant="glass" animated={false}>
              <SpendingTimeline
                data={last7DaysData}
                height={70}
                accentColor={design.palette.primary}
                formatValue={formatCOPCompact}
              />
            </CandyCard>
          </FadeInView>
        )}

        {/* Weekly Summary */}
        {(weeklyData.weekIncome > 0 || weeklyData.weekExpense > 0) && (
          <FadeInView delay={345} className="mx-5 mt-5">
            <Text className="text-candy-text text-base font-bold mb-3">
              Resumen semanal
            </Text>
            <CandyCard variant="glass" animated={false}>
              <WeeklySummaryCard
                weekIncome={weeklyData.weekIncome}
                weekExpense={weeklyData.weekExpense}
                previousWeekExpense={weeklyData.prevWeekExpense}
                formatValue={formatCOPCompact}
                accentColor={design.palette.primary}
              />
            </CandyCard>
          </FadeInView>
        )}

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

        {/* Top Categories with chart */}
        {categoryBreakdown.length > 0 && (
          <FadeInView delay={400} className="mx-5 mt-5">
            <Text className="text-candy-text text-base font-bold mb-3">
              Top Categorias
            </Text>
            <CandyCard variant="glass" animated={false}>
              {chartData.length > 0 && (
                <View className="mb-4">
                  <MiniBarChart
                    data={chartData}
                    height={80}
                    formatValue={formatCOPCompact}
                  />
                </View>
              )}
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

        {/* Recent Transactions with edit/delete */}
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
                      <View className="flex-row items-center gap-2">
                        <Text
                          className={`text-sm font-bold ${isExpense ? "text-candy-error" : "text-candy-blue"}`}
                        >
                          {isExpense ? "-" : "+"}
                          {formatCOP(tx.amount)}
                        </Text>
                        <ScalePress
                          onPress={() => handleDeleteTransaction(tx.id, tx.description)}
                          className="w-7 h-7 items-center justify-center"
                          style={{ borderRadius: 999, backgroundColor: toRgba("#e53e3e", 0.08) }}
                        >
                          <FontAwesome name="trash-o" size={11} color="#e53e3e" />
                        </ScalePress>
                      </View>
                    </View>
                  );
                })}
              </StaggeredList>
            </CandyCard>
          )}
        </FadeInView>

        {/* Profile / Settings shortcut */}
        <FadeInView delay={480} className="mx-5 mb-3">
          <ScalePress onPress={() => router.push("/profile")}>
            <CandyCard variant="glass" animated={false} className="flex-row items-center gap-3">
              <IconBadge icon="user" color={design.palette.primary} bgColor={toRgba(design.palette.primary, 0.15)} />
              <View className="flex-1">
                <Text className="text-candy-text font-semibold" style={{ fontSize: scaleFont(13, design.fontScale) }}>
                  Perfil y configuracion
                </Text>
                <Text className="text-candy-text-secondary" style={{ fontSize: scaleFont(11, design.fontScale) }}>
                  Edita tu identidad y ajustes de la app
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={design.palette.borderDark} />
            </CandyCard>
          </ScalePress>
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
