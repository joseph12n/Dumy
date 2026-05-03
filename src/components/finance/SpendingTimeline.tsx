/**
 * SpendingTimeline — Last 7 days spending as vertical bars
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface DayData {
  label: string; // e.g. "Lun", "Mar"
  expense: number;
  isToday?: boolean;
}

interface SpendingTimelineProps {
  data: DayData[];
  height?: number;
  accentColor?: string;
  formatValue?: (value: number) => string;
}

function TimelineBar({
  percentage,
  color,
  isToday,
  index,
  height,
}: {
  percentage: number;
  color: string;
  isToday: boolean;
  index: number;
  height: number;
}) {
  const barHeight = useSharedValue(0);

  useEffect(() => {
    barHeight.value = withDelay(
      index * 60,
      withTiming(percentage, { duration: 500 }),
    );
  }, [percentage, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: (barHeight.value / 100) * height,
    backgroundColor: isToday ? color : `${color}66`,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: percentage > 0 ? 3 : 0,
    width: '100%',
  }));

  return <Animated.View style={animatedStyle} />;
}

export function SpendingTimeline({
  data,
  height = 80,
  accentColor = '#e040a0',
  formatValue,
}: SpendingTimelineProps) {
  const maxExpense = Math.max(...data.map((d) => d.expense), 1);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height,
          gap: 4,
        }}
      >
        {data.map((day, idx) => {
          const percentage = (day.expense / maxExpense) * 100;
          return (
            <View
              key={day.label + idx}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
                height,
              }}
            >
              <TimelineBar
                percentage={percentage}
                color={accentColor}
                isToday={day.isToday ?? false}
                index={idx}
                height={height}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
        {data.map((day, idx) => (
          <View key={day.label + idx} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 9,
                color: day.isToday ? accentColor : '#9CA3AF',
                fontWeight: day.isToday ? '700' : '500',
              }}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
