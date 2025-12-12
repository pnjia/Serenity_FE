import React, { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { COLORS } from "../styles/authStyles";

// Interface props meng-extend TextInputProps agar fleksibel
interface RetroInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>; // Opsional: jika ingin mengatur margin luar
  height?: number;
  rightAccessory?: ReactNode;
}

const RetroInput: React.FC<RetroInputProps> = ({
  containerStyle,
  style,
  placeholderTextColor = COLORS.muted,
  height = 55,
  rightAccessory,
  ...props
}) => {
  const borderRadius = height / 2;
  const shadowOffset = height * 0.08;

  return (
    <View style={[styles.container, { height }, containerStyle]}>
      {/* 1. LAYER BAYANGAN (SHADOW) - Solid Blue */}
      <View
        style={[
          styles.shadowLayer,
          {
            top: shadowOffset,
            borderRadius,
            height,
          },
        ]}
      />

      {/* 2. LAYER INPUT UTAMA */}
      <View
        style={[
          styles.inputWrapper,
          {
            borderRadius,
            height,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              borderRadius,
              height,
            },
            style,
          ]} // Menggabungkan style bawaan jika ada
          placeholderTextColor={placeholderTextColor}
          {...props} // Menyebarkan (spread) semua props lain (value, onChangeText, dll)
        />
        {rightAccessory ? (
          <View style={styles.accessory}>{rightAccessory}</View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    position: "relative",
    marginVertical: 8,
  },

  shadowLayer: {
    position: "absolute",
    left: 3,
    width: "100%",
    backgroundColor: COLORS.deepIndigo, // Warna dari Logo (Deep Blue)
  },

  inputWrapper: {
    width: "100%",
    backgroundColor: COLORS.backdrop, // Warna background input (Light Blue-ish)
    borderWidth: 1.5,
    borderColor: COLORS.headline, // Border gelap
    justifyContent: "center",
    overflow: "hidden",
    // Hack agar shadow tidak terpotong di Android jika parent punya overflow hidden
    elevation: 0,
    zIndex: 2,
  },

  textInput: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    fontFamily: "Nunito_600SemiBold", // Pastikan font sudah di-link
    fontSize: 16,
    color: COLORS.headline,
    paddingRight: 48,
  },

  accessory: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
});

export default RetroInput;
