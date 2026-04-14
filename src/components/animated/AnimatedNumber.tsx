import React, { useEffect, useState } from "react";
import { Text, TextStyle } from "react-native";
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  style?: TextStyle;
  className?: string;
}

function defaultFormatter(n: number): string {
  return Math.round(n).toLocaleString("es-CO");
}

export function AnimatedNumber({
  value,
  duration = 800,
  formatter = defaultFormatter,
  style,
  className,
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);
  const [displayText, setDisplayText] = useState(formatter(0));

  const updateText = (v: number) => {
    setDisplayText(formatter(v));
  };

  useAnimatedReaction(
    () => animatedValue.value,
    (current) => {
      runOnJS(updateText)(current);
    },
  );

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  return (
    <Text style={style} className={className}>
      {displayText}
    </Text>
  );
}
