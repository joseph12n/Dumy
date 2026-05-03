/**
 * MiniBarChart — Simple bar chart using native Views
 * No external charting library needed
 */

import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface MiniBarChartProps {
  data: BarData[];
  height?: number;
  formatValue?: (value: number) => string;
  showLabels?: boolean;
  showValues?: boolean;
}

function AnimatedBar({
  percentage,
  color,
  index,
  height,
}: {
  percentage: number;
  color: string;
  index: number;
  height: number;
}) {
  const barHeight = useSharedValue(0);

  useEffect(() => {
    barHeight.value = withDelay(
      index * 80,
      withTiming(percentage, { duration: 600 }),
    );
  }, [percentage, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: (barHeight.value / 100) * height,
    backgroundColor: color,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: percentage > 0 ? 4 : 0,
  }));

  return <Animated.View style={animatedStyle} />;
}

export function MiniBarChart({
  data,
  height = 100,
  formatValue,
  showLabels = true,
  showValues = true,
}: MiniBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height,
          gap: 6,
        }}
      >
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <View
              key={item.label}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height }}
            >
              {showValues && item.value > 0 && (
                <Text
                  style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2, fontWeight: '600' }}
                  numberOfLines={1}
                >
                  {formatValue ? formatValue(item.value) : item.value}
                </Text>
              )}
              <AnimatedBar
                percentage={percentage}
                color={item.color}
                index={idx}
                height={height - (showValues ? 16 : 0)}
              />
            </View>
          );
        })}
      </View>
      {showLabels && (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
          {data.map((item) => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{ fontSize: 9, color: '#6B7280', textAlign: 'center' }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
