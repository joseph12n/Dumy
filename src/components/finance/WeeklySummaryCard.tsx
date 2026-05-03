/**
 * WeeklySummaryCard — Compact weekly income vs. expense comparison
 * Shows current week totals with animated bars and week-over-week change
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface WeeklySummaryCardProps {
  weekIncome: number;
  weekExpense: number;
  previousWeekExpense: number;
  formatValue?: (value: number) => string;
  accentColor?: string;
  incomeColor?: string;
  expenseColor?: string;
}

function AnimatedHBar({
  percentage,
  color,
  delay,
  height,
}: {
  percentage: number;
  color: string;
  delay: number;
  height: number;
}) {
  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withDelay(delay, withTiming(percentage, { duration: 700 }));
  }, [percentage, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    height,
    backgroundColor: color,
    borderRadius: height / 2,
    minWidth: percentage > 0 ? 6 : 0,
  }));

  return <Animated.View style={animatedStyle} />;
}

export function WeeklySummaryCard({
  weekIncome,
  weekExpense,
  previousWeekExpense,
  formatValue = (v) => `$${v.toLocaleString()}`,
  accentColor = '#e040a0',
  incomeColor = '#22C55E',
  expenseColor = '#EF4444',
}: WeeklySummaryCardProps) {
  const maxValue = Math.max(weekIncome, weekExpense, 1);
  const incomePercent = (weekIncome / maxValue) * 100;
  const expensePercent = (weekExpense / maxValue) * 100;

  const weekChange = useMemo(() => {
    if (previousWeekExpense <= 0) return null;
    return ((weekExpense - previousWeekExpense) / previousWeekExpense) * 100;
  }, [weekExpense, previousWeekExpense]);

  return (
    <View>
      {/* Income bar */}
      <View style={{ marginBottom: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: '#6B7280',
            }}
          >
            Ingresos
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: incomeColor,
            }}
          >
            {formatValue(weekIncome)}
          </Text>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: `${incomeColor}15`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <AnimatedHBar
            percentage={incomePercent}
            color={incomeColor}
            delay={100}
            height={8}
          />
        </View>
      </View>

      {/* Expense bar */}
      <View style={{ marginBottom: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: '#6B7280',
            }}
          >
            Gastos
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: expenseColor,
            }}
          >
            {formatValue(weekExpense)}
          </Text>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: `${expenseColor}15`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <AnimatedHBar
            percentage={expensePercent}
            color={expenseColor}
            delay={200}
            height={8}
          />
        </View>
      </View>

      {/* Balance + week-over-week change */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        }}
      >
        <View>
          <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '500' }}>
            Balance semanal
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: weekIncome - weekExpense >= 0 ? incomeColor : expenseColor,
            }}
          >
            {weekIncome - weekExpense >= 0 ? '+' : ''}
            {formatValue(weekIncome - weekExpense)}
          </Text>
        </View>

        {weekChange !== null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor:
                weekChange <= 0 ? `${incomeColor}15` : `${expenseColor}15`,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: weekChange <= 0 ? incomeColor : expenseColor,
              }}
            >
              {weekChange <= 0 ? '↓' : '↑'}{' '}
              {Math.abs(weekChange).toFixed(0)}%
            </Text>
            <Text
              style={{
                fontSize: 9,
                color: '#9CA3AF',
                fontWeight: '500',
              }}
            >
              vs sem. ant.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
