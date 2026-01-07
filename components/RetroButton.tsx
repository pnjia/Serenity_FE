import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";

import { COLORS } from "../styles/authStyles";

// Interface props meng-extend TouchableOpacityProps standar
interface RetroButtonProps extends TouchableOpacityProps {
  title: string;
  // Props Kustom untuk warna
  backgroundColor?: string; // Warna Tombol Utama (Default: Green Accent)
  shadowColor?: string; // Warna Bayangan (Default: Black)
  textColor?: string; // Warna Teks (Default: White)
  // Props Kustom untuk style tambahan
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  height?: number; // Opsional: jika ingin mengubah tinggi tombol
  leftIcon?: React.ReactNode;
}

const RetroButton: React.FC<RetroButtonProps> = ({
  title,
  onPress,
  onPressIn,
  onPressOut,
  backgroundColor = COLORS.emerald, // Default warna Teal/Hijau dari palette
  shadowColor = COLORS.deepIndigo, // Default bayangan hitam pekat sesuai image_2
  textColor = COLORS.white, // Default teks putih
  containerStyle,
  textStyle,
  height = 55, // Tinggi default standar tombol
  disabled,
  leftIcon,
  ...props // Menyebarkan sisa props TouchableOpacity (seperti activeOpacity)
}) => {
  const [isPressed, setIsPressed] = useState(false);
  // Menghitung radius berdasarkan tinggi agar selalu berbentuk "Pil" sempurna
  const borderRadius = height / 2;
  const shadowOffset = height * 0.12;
  const pressDepth = shadowOffset * 0.8;
  const translate = useRef(new Animated.Value(0)).current;

  // Style dinamis berdasarkan props
  const dynamicContainerStyle = {
    height: height,
    opacity: disabled ? 0.6 : 1, // Efek visual jika tombol disabled
  };

  const dynamicShadowStyle = {
    backgroundColor: shadowColor,
    borderRadius: borderRadius,
    top: shadowOffset,
    left: 3,
    height,
  };

  const dynamicButtonStyle = {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    transform: [
      {
        translateY: translate.interpolate({
          inputRange: [0, 1],
          outputRange: [0, pressDepth],
        }),
      },
      {
        translateX: translate.interpolate({
          inputRange: [0, 1],
          outputRange: [0, pressDepth * 0.25],
        }),
      },
    ],
  };

  const dynamicTextStyle = {
    color: textColor,
  };

  useEffect(() => {
    Animated.spring(translate, {
      toValue: isPressed ? 1 : 0,
      stiffness: 180,
      damping: 18,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [isPressed, translate]);

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      setIsPressed(true);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (!disabled) {
      setIsPressed(false);
    }
    onPressOut?.(event);
  };

  return (
    // Container View diperlukan untuk menampung bayangan absolute dan tombol relative
    <View style={[styles.container, dynamicContainerStyle, containerStyle]}>
      {/* LAYER 1: BAYANGAN SOLID (Posisi Absolute di belakang) */}
      <View style={[styles.shadowLayer, dynamicShadowStyle]} />

      {/* LAYER 2: TOMBOL UTAMA YANG BISA DIKLIK */}
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={1}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <Animated.View style={[styles.buttonWrapper, dynamicButtonStyle]}>
          <View style={styles.contentRow}>
            {leftIcon ? (
              <View style={styles.iconWrapper}>{leftIcon}</View>
            ) : null}
            <Text style={[styles.buttonText, dynamicTextStyle, textStyle]}>
              {title}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    position: "relative",
    marginVertical: 10,
    overflow: "visible",
  },

  touchable: {
    width: "100%",
    height: "100%",
  },

  shadowLayer: {
    position: "absolute",
    width: "100%",
    zIndex: 0,
    pointerEvents: "none",
  },

  buttonWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 2, // Pastikan di atas bayangan
    // elevation: 0, // Penting di Android untuk menghilangkan bayangan default yang blur
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontFamily: "Nunito_700Bold", // Gunakan font Nunito Bold agar tegas
    fontSize: 16,
    textAlign: "center",
    flexShrink: 1,
  },
});

export default RetroButton;
