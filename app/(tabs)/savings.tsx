import {
  AnimatedNumber,
  FadeInView,
  ScalePress,
  StaggeredList,
} from "@/src/components/animated";
import { CandyButton, CandyCard, EmptyState } from "@/src/components/common";
import { ProgressRing } from "@/src/components/finance";
import { useSavings } from "@/src/hooks/useSavings";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
  applyShadow,
  getCornerRadius,
  resolveRuntimeDesign,
  scaleFont,
  toRgba,
} from "@/src/theme/designRuntime";
import { formatCOP, formatCOPCompact } from "@/src/utils/currency";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GOAL_COLORS = [
  "#22C55E",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#6366F1",
];
const GOAL_ICONS: Array<{ icon: string; label: string }> = [
  { icon: "star", label: "Estrella" },
  { icon: "home", label: "Casa" },
  { icon: "car", label: "Auto" },
  { icon: "plane", label: "Viaje" },
  { icon: "book", label: "Estudio" },
  { icon: "heartbeat", label: "Salud" },
  { icon: "gift", label: "Regalo" },
  { icon: "trophy", label: "Meta" },
];

export default function SavingsScreen() {
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const {
    activeGoals,
    completedGoals,
    totalSaved,
    addGoal,
    deleteGoal,
    addContribution,
    getGoalProgress,
  } = useSavings();

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalColor, setGoalColor] = useState(GOAL_COLORS[0]);
  const [goalIcon, setGoalIcon] = useState("star");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contribution state
  const [contributingGoalId, setContributingGoalId] = useState<string | null>(
    null,
  );
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");

  const handleCreateGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert("Error", "Ingresa un nombre para la meta");
      return;
    }
    const parsed = parseInt(goalAmount.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) {
      Alert.alert("Error", "Ingresa un monto valido");
      return;
    }

    try {
      setIsSubmitting(true);
      await addGoal({
        name: goalName.trim(),
        targetAmount: parsed,
        deadline: goalDeadline.trim() || null,
        icon: goalIcon,
        color: goalColor,
      });
      setGoalName("");
      setGoalAmount("");
      setGoalDeadline("");
      setGoalColor(GOAL_COLORS[0]);
      setGoalIcon("star");
      setShowNewGoal(false);
      Alert.alert("Listo!", "Meta de ahorro creada");
    } catch {
      Alert.alert("Error", "No se pudo crear la meta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async () => {
    if (!contributingGoalId) return;
    const parsed = parseInt(contributionAmount.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) {
      Alert.alert("Error", "Ingresa un monto valido");
      return;
    }

    try {
      await addContribution({
        goalId: contributingGoalId,
        amount: parsed,
        note: contributionNote.trim() || "Aporte",
      });
      setContributionAmount("");
      setContributionNote("");
      setContributingGoalId(null);
    } catch {
      Alert.alert("Error", "No se pudo registrar el aporte");
    }
  };

  const handleDeleteGoal = (id: string, name: string) => {
    Alert.alert(
      "Eliminar meta",
      `¿Seguro que quieres eliminar "${name}"? Esta accion no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteGoal(id),
        },
      ],
    );
  };

  const allGoals = [...activeGoals, ...completedGoals];
  const globalProgress =
    allGoals.length > 0
      ? (totalSaved /
          Math.max(
            1,
            allGoals.reduce((s, g) => s + g.targetAmount, 0),
          )) *
        100
      : 0;

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
          {/* Hero Card */}
          <FadeInView delay={50} className="mx-5 mt-4">
            <LinearGradient
              colors={["#059669", "#10B981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-6"
              style={{
                borderRadius: getCornerRadius(design.radius, "card"),
                ...applyShadow(design.shadows.hero),
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-white/80 font-medium mb-1"
                    style={{ fontSize: scaleFont(13, design.fontScale) }}
                  >
                    Total ahorrado
                  </Text>
                  <AnimatedNumber
                    value={totalSaved}
                    formatter={(n) => formatCOP(Math.round(n))}
                    style={{
                      fontSize: scaleFont(30, design.fontScale),
                      fontWeight: "800",
                      color: "#ffffff",
                    }}
                  />
                  <Text
                    className="text-white/70 mt-1"
                    style={{ fontSize: scaleFont(12, design.fontScale) }}
                  >
                    {activeGoals.length} meta(s) activa(s) ·{" "}
                    {completedGoals.length} completada(s)
                  </Text>
                </View>
                <ProgressRing
                  progress={globalProgress}
                  size={70}
                  strokeWidth={7}
                  color="#ffffff"
                  bgColor="rgba(255,255,255,0.25)"
                />
              </View>
            </LinearGradient>
          </FadeInView>

          {/* New Goal Button */}
          <FadeInView delay={120} className="mx-5 mt-4">
            <CandyButton
              title={showNewGoal ? "Cancelar" : "Nueva meta de ahorro"}
              icon={
                <FontAwesome
                  name={showNewGoal ? "times" : "plus-circle"}
                  size={16}
                  color="#fff"
                />
              }
              onPress={() => setShowNewGoal(!showNewGoal)}
              variant={showNewGoal ? "secondary" : "primary"}
            />
          </FadeInView>

          {/* New Goal Form */}
          {showNewGoal && (
            <FadeInView slideFrom={12} className="mx-5 mt-3">
              <CandyCard variant="glass" animated={false}>
                <Text
                  className="text-candy-text font-bold mb-3"
                  style={{ fontSize: scaleFont(16, design.fontScale) }}
                >
                  Crear meta
                </Text>

                <TextInput
                  className="bg-white border px-4 py-3 text-candy-text mb-3"
                  style={{
                    borderColor: design.palette.borderLight,
                    borderRadius: getCornerRadius(design.radius, "card"),
                    fontSize: scaleFont(14, design.fontScale),
                  }}
                  placeholder="Nombre de la meta (ej: Viaje a Cartagena)"
                  placeholderTextColor={design.palette.borderDark}
                  value={goalName}
                  onChangeText={setGoalName}
                />

                <Text
                  className="text-candy-text font-semibold mb-2"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Monto objetivo (COP)
                </Text>
                <View
                  className="flex-row items-center bg-white border px-4 mb-3"
                  style={{
                    borderColor: design.palette.borderLight,
                    borderRadius: getCornerRadius(design.radius, "card"),
                  }}
                >
                  <Text className="text-candy-text text-lg font-bold mr-2">
                    $
                  </Text>
                  <TextInput
                    className="flex-1 py-3 text-candy-text"
                    style={{ fontSize: scaleFont(16, design.fontScale) }}
                    placeholder="0"
                    placeholderTextColor={design.palette.borderDark}
                    keyboardType="numeric"
                    value={goalAmount}
                    onChangeText={setGoalAmount}
                  />
                </View>

                <Text
                  className="text-candy-text font-semibold mb-2"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Fecha limite (opcional)
                </Text>
                <TextInput
                  className="bg-white border px-4 py-3 text-candy-text mb-3"
                  style={{
                    borderColor: design.palette.borderLight,
                    borderRadius: getCornerRadius(design.radius, "card"),
                    fontSize: scaleFont(14, design.fontScale),
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={design.palette.borderDark}
                  value={goalDeadline}
                  onChangeText={setGoalDeadline}
                />

                <Text
                  className="text-candy-text font-semibold mb-2"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Icono
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {GOAL_ICONS.map((item) => (
                    <ScalePress
                      key={item.icon}
                      onPress={() => setGoalIcon(item.icon)}
                      className="w-10 h-10 items-center justify-center"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "pill"),
                        backgroundColor:
                          goalIcon === item.icon
                            ? goalColor + "30"
                            : design.palette.surfaceLight,
                        borderWidth: goalIcon === item.icon ? 2 : 0,
                        borderColor: goalColor,
                      }}
                    >
                      <FontAwesome
                        name={item.icon as any}
                        size={16}
                        color={
                          goalIcon === item.icon
                            ? goalColor
                            : design.palette.borderDark
                        }
                      />
                    </ScalePress>
                  ))}
                </View>

                <Text
                  className="text-candy-text font-semibold mb-2"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Color
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {GOAL_COLORS.map((c) => (
                    <ScalePress
                      key={c}
                      onPress={() => setGoalColor(c)}
                      className="w-8 h-8"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "pill"),
                        backgroundColor: c,
                        borderWidth: goalColor === c ? 2 : 0,
                        borderColor: design.palette.textLight,
                      }}
                    />
                  ))}
                </View>

                <CandyButton
                  title="Crear Meta"
                  onPress={handleCreateGoal}
                  loading={isSubmitting}
                  icon={
                    <FontAwesome name="check" size={14} color="#fff" />
                  }
                />
              </CandyCard>
            </FadeInView>
          )}

          {/* Active Goals */}
          <FadeInView delay={180} className="mx-5 mt-5">
            <Text
              className="text-candy-text font-bold mb-3"
              style={{ fontSize: scaleFont(16, design.fontScale) }}
            >
              Metas activas ({activeGoals.length})
            </Text>

            {activeGoals.length === 0 ? (
              <EmptyState
                icon="bullseye"
                title="Sin metas de ahorro"
                subtitle="Crea tu primera meta para empezar a ahorrar"
              />
            ) : (
              <StaggeredList staggerDelay={60}>
                {activeGoals.map((goal) => {
                  const progress = getGoalProgress(goal);
                  const isContributing = contributingGoalId === goal.id;
                  return (
                    <CandyCard
                      key={goal.id}
                      variant="glass"
                      animated={false}
                      className="mb-3"
                    >
                      <View className="flex-row items-center gap-3">
                        <ProgressRing
                          progress={progress}
                          size={56}
                          strokeWidth={6}
                          color={goal.color}
                          bgColor={goal.color + "20"}
                        />
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <FontAwesome
                              name={goal.icon as any}
                              size={14}
                              color={goal.color}
                            />
                            <Text
                              className="text-candy-text font-bold"
                              style={{
                                fontSize: scaleFont(14, design.fontScale),
                              }}
                              numberOfLines={1}
                            >
                              {goal.name}
                            </Text>
                          </View>
                          <Text
                            className="text-candy-text-secondary mt-1"
                            style={{
                              fontSize: scaleFont(12, design.fontScale),
                            }}
                          >
                            {formatCOPCompact(goal.currentAmount)} /{" "}
                            {formatCOPCompact(goal.targetAmount)}
                          </Text>
                          {goal.deadline && (
                            <Text
                              className="text-candy-text-secondary"
                              style={{
                                fontSize: scaleFont(10, design.fontScale),
                              }}
                            >
                              Fecha limite: {goal.deadline}
                            </Text>
                          )}
                        </View>
                        <View className="flex-row gap-1">
                          <ScalePress
                            onPress={() =>
                              setContributingGoalId(
                                isContributing ? null : goal.id,
                              )
                            }
                            className="w-9 h-9 items-center justify-center"
                            style={{
                              borderRadius: getCornerRadius(
                                design.radius,
                                "pill",
                              ),
                              backgroundColor: isContributing
                                ? goal.color
                                : toRgba(goal.color, 0.15),
                            }}
                          >
                            <FontAwesome
                              name="plus"
                              size={14}
                              color={isContributing ? "#fff" : goal.color}
                            />
                          </ScalePress>
                          <ScalePress
                            onPress={() =>
                              handleDeleteGoal(goal.id, goal.name)
                            }
                            className="w-9 h-9 items-center justify-center"
                            style={{
                              borderRadius: getCornerRadius(
                                design.radius,
                                "pill",
                              ),
                              backgroundColor: toRgba("#e53e3e", 0.1),
                            }}
                          >
                            <FontAwesome
                              name="trash-o"
                              size={14}
                              color="#e53e3e"
                            />
                          </ScalePress>
                        </View>
                      </View>

                      {/* Progress bar */}
                      <View
                        className="mt-3 h-2 overflow-hidden"
                        style={{
                          backgroundColor: goal.color + "20",
                          borderRadius: getCornerRadius(design.radius, "pill"),
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            height: "100%",
                            backgroundColor: goal.color,
                            borderRadius: getCornerRadius(
                              design.radius,
                              "pill",
                            ),
                          }}
                        />
                      </View>

                      {/* Contribution form */}
                      {isContributing && (
                        <FadeInView slideFrom={8} duration={200}>
                          <View className="mt-3 pt-3 border-t border-candy-outline-light">
                            <Text
                              className="text-candy-text font-semibold mb-2"
                              style={{
                                fontSize: scaleFont(12, design.fontScale),
                              }}
                            >
                              Agregar aporte
                            </Text>
                            <View className="flex-row gap-2">
                              <View
                                className="flex-1 flex-row items-center bg-white border px-3"
                                style={{
                                  borderColor: design.palette.borderLight,
                                  borderRadius: getCornerRadius(
                                    design.radius,
                                    "card",
                                  ),
                                }}
                              >
                                <Text className="text-candy-text font-bold mr-1">
                                  $
                                </Text>
                                <TextInput
                                  className="flex-1 py-2 text-candy-text"
                                  style={{
                                    fontSize: scaleFont(14, design.fontScale),
                                  }}
                                  placeholder="Monto"
                                  placeholderTextColor={
                                    design.palette.borderDark
                                  }
                                  keyboardType="numeric"
                                  value={contributionAmount}
                                  onChangeText={setContributionAmount}
                                />
                              </View>
                              <ScalePress
                                onPress={handleContribute}
                                className="px-4 py-2 items-center justify-center"
                                style={{
                                  borderRadius: getCornerRadius(
                                    design.radius,
                                    "pill",
                                  ),
                                  backgroundColor: goal.color,
                                  ...applyShadow(design.shadows.button),
                                }}
                              >
                                <Text
                                  className="text-white font-bold"
                                  style={{
                                    fontSize: scaleFont(13, design.fontScale),
                                  }}
                                >
                                  Ahorrar
                                </Text>
                              </ScalePress>
                            </View>
                            <TextInput
                              className="bg-white border px-3 py-2 text-candy-text mt-2"
                              style={{
                                borderColor: design.palette.borderLight,
                                borderRadius: getCornerRadius(
                                  design.radius,
                                  "card",
                                ),
                                fontSize: scaleFont(12, design.fontScale),
                              }}
                              placeholder="Nota (opcional)"
                              placeholderTextColor={design.palette.borderDark}
                              value={contributionNote}
                              onChangeText={setContributionNote}
                            />
                          </View>
                        </FadeInView>
                      )}
                    </CandyCard>
                  );
                })}
              </StaggeredList>
            )}
          </FadeInView>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <FadeInView delay={250} className="mx-5 mt-4 mb-6">
              <Text
                className="text-candy-text font-bold mb-3"
                style={{ fontSize: scaleFont(16, design.fontScale) }}
              >
                Metas completadas ({completedGoals.length})
              </Text>
              <StaggeredList staggerDelay={40}>
                {completedGoals.map((goal) => (
                  <CandyCard
                    key={goal.id}
                    variant="glass"
                    animated={false}
                    className="mb-3"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-11 h-11 items-center justify-center"
                        style={{
                          borderRadius: 999,
                          backgroundColor: goal.color + "20",
                        }}
                      >
                        <FontAwesome
                          name="check"
                          size={18}
                          color={goal.color}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-candy-text font-bold"
                          style={{
                            fontSize: scaleFont(14, design.fontScale),
                          }}
                          numberOfLines={1}
                        >
                          {goal.name}
                        </Text>
                        <Text
                          className="text-candy-text-secondary"
                          style={{
                            fontSize: scaleFont(12, design.fontScale),
                          }}
                        >
                          {formatCOP(goal.targetAmount)} — Completada!
                        </Text>
                      </View>
                      <FontAwesome name="trophy" size={20} color="#F59E0B" />
                    </View>
                  </CandyCard>
                ))}
              </StaggeredList>
            </FadeInView>
          )}

          {/* Motivational */}
          <FadeInView delay={300} className="mx-5 mb-8">
            <LinearGradient
              colors={["#059669", "#10B981"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
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
                Cada peso que ahorras es un paso hacia tu meta. Mantente enfocado!
              </Text>
            </LinearGradient>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
