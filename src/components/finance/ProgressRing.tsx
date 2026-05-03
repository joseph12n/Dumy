/**
 * ProgressRing — Circular progress indicator using native Views
 * Approximates a ring via stacked arc segments
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  valueLabel?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#22C55E',
  bgColor = '#E5E7EB',
  label,
  valueLabel,
}: ProgressRingProps) {
  const animProgress = useSharedValue(0);
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    animProgress.value = withTiming(clampedProgress, { duration: 800 });
  }, [clampedProgress]);

  const innerSize = size - strokeWidth * 2;

  // We approximate a ring using 4 rotating quadrant masks
  const leftStyle = useAnimatedStyle(() => {
    const p = animProgress.value;
    const rotate = p <= 50
      ? interpolate(p, [0, 50], [0, 180])
      : 180;
    return { transform: [{ rotate: `${rotate}deg` }] };
  });

  const rightStyle = useAnimatedStyle(() => {
    const p = animProgress.value;
    const rotate = p <= 50 ? 0 : interpolate(p, [50, 100], [0, 180]);
    return { transform: [{ rotate: `${rotate}deg` }] };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Left half */}
        <View
          style={{
            position: 'absolute',
            width: size / 2,
            height: size,
            left: 0,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: size / 2,
                height: size,
                left: 0,
                borderTopLeftRadius: size / 2,
                borderBottomLeftRadius: size / 2,
                backgroundColor: color,
                transformOrigin: 'right center',
              },
              leftStyle,
            ]}
          />
        </View>

        {/* Right half */}
        <View
          style={{
            position: 'absolute',
            width: size / 2,
            height: size,
            right: 0,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: size / 2,
                height: size,
                right: 0,
                borderTopRightRadius: size / 2,
                borderBottomRightRadius: size / 2,
                backgroundColor: color,
                transformOrigin: 'left center',
              },
              rightStyle,
            ]}
          />
        </View>

        {/* Inner circle (hollow center) */}
        <View
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <Text
            style={{
              fontSize: size * 0.18,
              fontWeight: '800',
              color: color,
            }}
          >
            {valueLabel ?? `${Math.round(clampedProgress)}%`}
          </Text>
        </View>
      </View>
      {label && (
        <Text
          style={{
            fontSize: 11,
            color: '#6B7280',
            marginTop: 6,
            textAlign: 'center',
            fontWeight: '600',
          }}
          numberOfLines={2}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
