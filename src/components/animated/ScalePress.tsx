import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface ScalePressProps extends Omit<PressableProps, "style"> {
  scaleValue?: number;
  haptic?: boolean;
  children?: React.ReactNode;
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function ScalePress({
  scaleValue = 0.97,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  children,
  containerClassName,
  containerStyle,
  className,
  style,
  ...props
}: ScalePressProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleValue, {
      damping: 15,
      stiffness: 200,
    });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });
    onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  return (
    <Animated.View
      style={[animatedStyle, containerStyle]}
      className={containerClassName}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
