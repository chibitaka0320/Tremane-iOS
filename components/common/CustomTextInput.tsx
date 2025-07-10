import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/styles/theme"; // ご利用中のテーマに合わせて

type Props = TextInputProps & {
  isPassword?: boolean;
  hasError?: boolean;
};

export default function CustomTextInput({
  isPassword,
  hasError,
  ...props
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword ?? false);

  const getBorderColor = () => {
    if (hasError) return "red"; // エラー色（テーマがなければ赤）
    if (isFocused) return "#72D2FF";
    return theme.colors.lightGray;
  };

  return (
    <View
      style={[
        styles.inputContainer,
        {
          borderColor: getBorderColor(),
        },
      ]}
    >
      <TextInput
        {...props}
        secureTextEntry={isPassword ? isSecure : false}
        style={[styles.input, props.style]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
          <Ionicons
            name={isSecure ? "eye-off" : "eye"}
            size={20}
            color={theme.colors.lightGray}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[3],
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    paddingVertical: 0, // 高さが固定されているため上下パディングはなし
  },
});
